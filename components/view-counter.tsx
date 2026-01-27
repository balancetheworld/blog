/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-01-27 21:09:46
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-01-27 21:10:01
 * @FilePath: /blog/my-next-app/components/view-counter.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

interface ViewCounterProps {
  postId: string
  initialViews: number
}

export function ViewCounter({ postId, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews)

  useEffect(() => {
    // 增加浏览次数
    fetch(`/api/posts/${postId}/views`, { method: "POST" })
      .then(res => res.json())
      .then(data => setViews(data.views))
      .catch(console.error)
  }, [postId])

  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <Eye className="h-4 w-4" />
      <span>{views} 次浏览</span>
    </span>
  )
}
