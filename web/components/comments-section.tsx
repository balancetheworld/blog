"use client"

import React from "react"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, User } from "lucide-react"
import type { Comment } from "@/lib/store"

interface CommentsSectionProps {
  postId: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

// 本地格式化函数，支持 number 和 string
function formatDate(date: string | number) {
  const dateObj = typeof date === 'number' ? new Date(date) : new Date(date)
  return dateObj.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { data: comments, isLoading } = useSWR<Comment[]>(
    `/api/comments/post/${postId}`,
    fetcher
  )
  
  const [author, setAuthor] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!author.trim() || !content.trim()) {
      setError("请填写昵称和评论内容")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim(), content: content.trim(), postId })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "评论失败")
      }

      // 刷新评论列表
      mutate(`/api/comments/post/${postId}`)
      setContent("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "评论失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-foreground" />
        <h2 className="text-xl font-semibold text-foreground">
          评论 ({comments?.length ?? 0})
        </h2>
      </div>

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <Input
              placeholder="你的昵称"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={50}
              className="max-w-xs"
            />
            <Textarea
              placeholder="写下你的评论..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              rows={3}
              className="resize-none"
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || !author.trim() || !content.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "发送中..." : "发送评论"}
            </Button>
          </div>
        </div>
      </form>

      {/* 评论列表 */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>暂无评论，来写下第一条评论吧！</p>
          </div>
        ) : (
          comments?.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-medium text-secondary-foreground">
                    {comment.author.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
