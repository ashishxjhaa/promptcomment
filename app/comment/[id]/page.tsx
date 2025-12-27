'use client'

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import Back from "@/components/Back"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import CommentItem from "@/components/CommentItem"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"


interface Prompt {
    id: string;
    title: string
    _count?: {
        comments: number
    }
}

interface Comment {
    id: string
    content: string
    createdAt: string
    isEdited: boolean
    user: {
        username: string
    }
}

export default function PromptDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [prompt, setPrompt] = useState<Prompt | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
    const [username, setUsername] = useState("")

    const COMMENTS_PER_PAGE = 20

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId')
        const storedUsername = localStorage.getItem('username')
    
        if (!storedUserId || !storedUsername) {
            router.push('/')
            return
        }

        setUsername(storedUsername)

        const fetchData = async () => {
            try {
                const [promptRes, commentsRes] = await Promise.all([
                    axios.get(`/api/prompts/${params.id}`),
                    axios.get(`/api/prompts/${params.id}/comments?page=${currentPage}&limit=${COMMENTS_PER_PAGE}&sort=${sortOrder}`)
                ])
                setPrompt(promptRes.data)
                setComments(commentsRes.data.comments)
                setTotalPages(commentsRes.data.totalPages)
            } catch (error) {
                console.log(error)
                toast.error("Failed to load data")
            }
        }

        fetchData()
    }, [params.id, currentPage, sortOrder, router, COMMENTS_PER_PAGE])

    const handleAddComment = async () => {
        if (newComment.trim().length < 10) {
            toast.error("Comment must be at least 10 characters")
            return
        }
        if (newComment.trim().length > 2000) {
            toast.error("Comment must be less than 2000 characters")
            return
        }

        setLoading(true)
        try {
            await axios.post(`/api/prompts/${params.id}/comments`, {
                content: newComment,
                username
            })
            setNewComment("")
            toast.success("Comment added")
            setCurrentPage(1)
            
            const response = await axios.get(
                `/api/prompts/${params.id}/comments?page=1&limit=${COMMENTS_PER_PAGE}&sort=${sortOrder}`
            )
            setComments(response.data.comments)
            setTotalPages(response.data.totalPages)
        } catch (error) {
            console.log(error)
            toast.error("Failed to add comment")
        } finally {
            setLoading(false)
        }
    }

    if (!prompt) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <Back />
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-medium tracking-tight mb-8">{prompt.title}</h1>

                <div className="bg-white p-6 rounded-lg mb-6 border border-gray-200">
                    <h2 className="text-xl tracking-tight font-medium mb-4">Add a Comment</h2>
                    <Textarea
                        placeholder="Write your comment... (10-2000 characters)"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-3 bg-white min-h-24"
                        maxLength={2000}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            {newComment.length}/2000 characters
                        </span>
                        <Button onClick={handleAddComment} disabled={loading || newComment.trim().length < 10}>
                            {loading ? <Spinner className="w-4 h-4" /> : "Post Comment"}
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl tracking-tight font-medium">
                        Comments ({prompt._count?.comments || 0})
                    </h2>
                    <select
                        value={sortOrder}
                        onChange={(e) => {
                            setSortOrder(e.target.value as 'newest' | 'oldest');
                            setCurrentPage(1);
                        }}
                        className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>

                {comments.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
                        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 mb-6">
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUserId={username}
                                    onUpdate={async () => {
                                        const response = await axios.get(
                                            `/api/prompts/${params.id}/comments?page=${currentPage}&limit=${COMMENTS_PER_PAGE}&sort=${sortOrder}`
                                        )
                                        setComments(response.data.comments)
                                        setTotalPages(response.data.totalPages)
                                    }}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                onClick={() => setCurrentPage(page)}
                                                isActive={currentPage === page}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}