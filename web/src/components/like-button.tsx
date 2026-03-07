"use client"

import { Heart } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import Link from "next/link"
import api from "@/services/api"

interface LikeButtonProps {
  articleType: "post" | "note"
  articleId: number
}

export function LikeButton({ articleType, articleId }: LikeButtonProps) {
  const { isAuthenticated } = useAuth()
  const { locale } = useI18n()
  const [animating, setAnimating] = useState(false)
  // 直接管理点赞状态
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // 获取点赞状态
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await api.get<any>(`/api/likes?type=${articleType}&articleId=${articleId}`)
        if (response?.data) {
          setLiked(response.data.liked || false)
          setCount(response.data.count || 0)
        }
      } catch (error) {
        // Silent fail for like status
      } finally {
        setLoading(false)
      }
    }

    fetchLikeStatus()
  }, [articleType, articleId])

  const handleLike = async () => {
    if (!isAuthenticated) return

    setAnimating(true)
    setTimeout(() => setAnimating(false), 600)

    // Optimistic update
    const newLiked = !liked
    const newCount = liked ? count - 1 : count + 1
    setLiked(newLiked)
    setCount(newCount)

    try {
      const result = await api.post<any>('/api/likes', { article_type: articleType, article_id: articleId })

      // 使用服务器返回的最终状态
      if (result?.data) {
        setLiked(result.data.liked || false)
        setCount(result.data.count || 0)
      }
    } catch (error) {
      // 回滚乐观更新
      setLiked(liked)
      setCount(count)
    }
  }

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">
        <Heart className="h-4 w-4" />
        <span>...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
      >
        <Heart className="h-4 w-4" />
        <span>{count}</span>
        <span className="text-xs">
          {locale === "zh" ? "登录后点赞" : "Login to like"}
        </span>
      </Link>
    )
  }

  return (
    <button
      onClick={handleLike}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
        liked
          ? "border-red-200 bg-red-50 text-red-600 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400"
          : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      } ${animating ? "scale-110" : "scale-100"}`}
    >
      <Heart
        className={`h-4 w-4 transition-all ${liked ? "fill-current" : ""} ${animating ? "scale-125" : ""}`}
      />
      <span className="font-medium">{count}</span>
    </button>
  )
}
