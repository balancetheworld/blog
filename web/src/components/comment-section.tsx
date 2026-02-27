"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { fetcher } from "@/lib/fetcher"
import api from "@/services/api"

interface Comment {
  id: number
  content: string
  created_at: string
  user_id: number
  username: string
  display_name: string
}

interface CommentSectionProps {
  articleType: "post" | "note"
  articleId: number
}

function timeAgo(date: string, locale: string) {
  const now = Date.now()
  const d = new Date(date).getTime()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return locale === "zh" ? "\u521a\u521a" : "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)} ${locale === "zh" ? "\u5206\u949f\u524d" : "min ago"}`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${locale === "zh" ? "\u5c0f\u65f6\u524d" : "h ago"}`
  if (diff < 604800) return `${Math.floor(diff / 86400)} ${locale === "zh" ? "\u5929\u524d" : "d ago"}`
  return new Date(date).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
  })
}

export function CommentSection({ articleType, articleId }: CommentSectionProps) {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const { locale } = useI18n()
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data, mutate } = useSWR(
    `/api/comments?type=${articleType}&articleId=${articleId}`,
    fetcher
  )

  const comments: Comment[] = data?.data || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    try {
      await api.post('/api/comments', { article_type: articleType, article_id: articleId, content: content.trim() })
      setContent("")
      mutate()
    } catch (error) {
      console.error('Failed to submit comment:', error)
    }
    setSubmitting(false)
  }

  const handleDelete = async (commentId: number) => {
    setDeletingId(commentId)
    try {
      await api.delete(`/api/comments/${commentId}`)
      mutate()
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
    setDeletingId(null)
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold text-foreground">
          {locale === "zh" ? "\u8bc4\u8bba" : "Comments"}
          {comments.length > 0 && (
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </h3>
      </div>

      {/* Comment input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="glass-card-static overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-xs text-muted-foreground">{user?.displayName}</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={locale === "zh" ? "\u5199\u4e0b\u4f60\u7684\u8bc4\u8bba..." : "Write a comment..."}
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
              rows={3}
            />
            <div className="flex justify-end border-t border-border px-3 py-2">
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {locale === "zh" ? "\u53d1\u9001" : "Send"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 glass-card-static flex items-center justify-center py-6">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {locale === "zh" ? "\u767b\u5f55\u540e\u53c2\u4e0e\u8bc4\u8bba" : "Sign in to comment"} &rarr;
          </Link>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground/60 py-6">
          {locale === "zh" ? "\u8fd8\u6ca1\u6709\u8bc4\u8bba\uff0c\u6765\u8bf4\u7b2c\u4e00\u53e5\u5427" : "No comments yet. Be the first!"}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="glass-card-static px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {comment.display_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground truncate block">
                      {comment.display_name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {timeAgo(comment.created_at, locale)}
                    </span>
                  </div>
                </div>
                {/* Delete button: owner or admin */}
                {(comment.user_id === user?.id || isAdmin) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="shrink-0 rounded-md p-1 text-muted-foreground/40 transition-colors hover:text-destructive"
                    aria-label="Delete comment"
                  >
                    {deletingId === comment.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-foreground/95 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
