'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import PromptCard from "@/components/PromptCard"

interface Prompt {
  id: string
  title: string
  _count: {
    comments: number
  }
}

export default function CommentPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.push('/')
      return
    }

    fetchPrompts()
  }, [router])

  const fetchPrompts = async () => {
    try {
      const response = await axios.get('/api/prompts')
      setPrompts(response.data)
    } catch (error) {
      console.error("Error fetching prompts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#F4F3ED]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight mb-8">All Prompts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              title={prompt.title}
              commentCount={prompt._count.comments}
            />
          ))}
        </div>
      </div>
    </div>
  )
}