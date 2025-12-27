'use client'

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { getTimeAgo, canEditComment } from "@/lib/time"
import axios from "axios"
import { toast } from "sonner"
import { Spinner } from "./ui/spinner"

interface CommentItemProps {
    comment: {
        id: string
        content: string
        createdAt: string
        isEdited: boolean
        user: {
            username: string
        }
    }
    currentUserId: string
    onUpdate: () => void
}

export default function CommentItem({ comment, currentUserId, onUpdate }: CommentItemProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)
    const [loading, setLoading] = useState(false)

    const isOwner = currentUserId === comment.user.username
    const canEdit = canEditComment(comment.createdAt)

    const handleEdit = async () => {
        if (editContent.trim().length < 10) {
            toast.error("Comment must be at least 10 characters")
            return
        }
        if (editContent.trim().length > 2000) {
            toast.error("Comment must be less than 2000 characters")
            return
        }

        setLoading(true);
        try {
            await axios.put(`/api/comments/${comment.id}`, { content: editContent })
            toast.success("Comment updated")
            setIsEditing(false)
            onUpdate()
        } catch (error) {
            console.log(error)
            toast.error("Failed to update comment")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Delete this comment?")) return
    
        setLoading(true)
        try {
            await axios.delete(`/api/comments/${comment.id}`)
            toast.success("Comment deleted")
            onUpdate()
        } catch (error) {
            console.log(error)
            toast.error("Failed to delete comment")
        } finally {
            setLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mb-3 bg-white"
                    maxLength={2000}
                />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        {editContent.length}/2000
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false)
                                setEditContent(comment.content)
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleEdit} disabled={loading}>
                            {loading ? <Spinner className="w-4 h-4" /> : "Save"}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{comment.user.username}</span>
                    <span className="text-sm text-gray-500">
                        {getTimeAgo(comment.createdAt)}
                    </span>
                    {comment.isEdited && (
                        <span className="text-xs text-gray-400 italic">(edited)</span>
                    )}
                </div>
                {isOwner && canEdit && (
                    <div className="flex gap-2">
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setIsEditing(true)}
                            disabled={loading}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
            <p className="text-gray-800 whitespace-pre-wrap wrap-break-word">{comment.content}</p>
        </div>
    )
}
