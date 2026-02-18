"use client"

import { Heart } from "lucide-react"
import useSWR from "swr"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface LikeButtonProps {
  articleType: "post" | "note"
  articleId: number
}

export function LikeButton({ articleType, articleId }: LikeButtonProps) {
  const { isAuthenticated } = useAuth()
  const { locale } = useI18n()
  const [animating, setAnimating] = useState(false)

  const { data, mutate } = useSWR(
    `/api/likes?type=${articleType}&articleId=${articleId}`,
    fetcher
  )

  const count = data?.count || 0
  const liked = data?.liked || false

  const handleLike = async () => {
    if (!isAuthenticated) return

    setAnimating(true)
    setTimeout(() => setAnimating(false), 600)

    // Optimistic update
    mutate(
      { ...data, count: liked ? count - 1 : count + 1, liked: !liked },
      false
    )

    await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: articleType, articleId }),
    })

    mutate()
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
          {locale === "zh" ? "\u767b\u5f55\u540e\u70b9\u8d5e" : "Login to like"}
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
