"use client"

import Link from "next/link"
import useSWR from "swr"
import { useI18n } from "@/lib/i18n-context"
import { fetcher } from "@/lib/fetcher"

interface Post {
  id: number
  slug: string
  title: string
  summary: string
  lang: string
  created_at: string
}

export function PostList() {
  const { locale, t } = useI18n()
  const { data, isLoading } = useSWR(`/api/articles?lang=${locale}`, fetcher)

  const posts: Post[] = data?.data || []

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="h-5 w-2/3 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">{t("blog.empty")}</p>
    )
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <Link
          key={`${post.id}-${post.lang}`}
          href={`/article/${post.slug}`}
          className="group block rounded-lg p-4 -mx-4 transition-colors hover:bg-accent"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors text-balance">
              {post.title}
            </h2>
            <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {new Date(post.created_at).toLocaleDateString(
                locale === "zh" ? "zh-CN" : "en-US",
                { year: "numeric", month: "short", day: "numeric" }
              )}
            </time>
          </div>
          {post.summary && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {post.summary}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}
