/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-01-27 21:08:44
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-01-27 21:08:53
 * @FilePath: /blog/my-next-app/components/post-card.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Link from "next/link"
import type { Post, Category } from "@/lib/store"
import { Eye, Heart, MessageCircle, FolderOpen } from "lucide-react"

function formatDate(date: string | number) {
  const dateObj = typeof date === 'number' ? new Date(date) : new Date(date)
  return dateObj.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

interface PostCardProps {
  post: Post & { commentsCount?: number; category?: Category }
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {formatDate(post.createdAt)}
          </time>
          {post.category && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1 text-primary">
                <FolderOpen className="h-3.5 w-3.5" />
                {post.category.name}
              </span>
            </>
          )}
          {(post.tags?.length || 0) > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-1">
                {post.tags?.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.views}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {post.likes}
          </span>
          {post.commentsCount !== undefined && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post.commentsCount}
            </span>
          )}
        </div>
      </div>
      
      <h2 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-foreground/80">
        <Link href={`/posts/${post.slug}`} className="after:absolute after:inset-0">
          {post.title}
        </Link>
      </h2>
      
      <p className="line-clamp-2 text-muted-foreground">
        {post.excerpt}
      </p>
      
      <div className="mt-2 flex items-center text-sm font-medium text-foreground">
        阅读更多
        <svg
          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </article>
  )
}
