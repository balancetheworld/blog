/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-01-27 21:07:23
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-01-27 21:07:31
 * @FilePath: /blog/my-next-app/components/like-button.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  postId: string
  initialLikes: number
}

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 检查是否已点赞
    fetch(`/api/posts/${postId}/like`)
      .then(res => res.json())
      .then(data => {
        setLiked(data.liked)
        setLikes(data.likes)
      })
      .catch(console.error)
  }, [postId])

  const handleLike = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST"
      })
      const data = await res.json()
      setLiked(data.liked)
      setLikes(data.likes)
    } catch (error) {
      console.error("点赞失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "gap-2 transition-all",
        liked && "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all",
          liked && "fill-current"
        )} 
      />
      <span>{likes}</span>
      <span className="sr-only">点赞</span>
    </Button>
  )
}
