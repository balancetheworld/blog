"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { useI18n } from "@/lib/i18n-context"
import { HtmlRenderer } from "./html-renderer"
import { LikeButton } from "./like-button"
import { CommentSection } from "./comment-section"
import { ArrowLeft, Eye, Heart, Tag } from "lucide-react"
import { fetcher } from "@/lib/fetcher"
import type { PostData } from "@/types/components"

export function PostDetail() {
  const params = useParams()
  const slug = params?.slug as string
  const { locale, t } = useI18n()

  const { data, isLoading } = useSWR(
    slug ? `/api/article/${slug}` : null,
    fetcher
  )

  const post: PostData | null = data?.data || null

  if (isLoading) {
    return (
      <div className="animate-pulse py-8">
        <div className="glass-card-static p-8">
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="mt-4 h-4 w-32 rounded bg-muted" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Post not found</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("blog.back")}
        </Link>
      </div>
    )
  }

  const translation = post.translations.find((t) => t.lang === locale) ||
    post.translations[0]

  if (!translation) return null

  return (
    <article className="py-8 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("blog.back")}
      </Link>

      <div className="glass-card-static mt-6 p-6 md:p-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance md:text-3xl">
            {translation.title}
          </h1>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <time>
              {new Date(post.created_at).toLocaleDateString(
                locale === "zh" ? "zh-CN" : "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </time>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.view_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post.like_count || 0}
            </span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="mt-8 border-t border-border pt-8">
          <HtmlRenderer content={translation.content} />
        </div>

        {/* Like button */}
        <div className="mt-8 flex items-center border-t border-border pt-6">
          <LikeButton articleType="post" articleId={post.id} />
        </div>
      </div>

      {/* Comments */}
      <CommentSection articleType="post" articleId={post.id} />
    </article>
  )
}
