"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { useI18n } from "@/lib/i18n-context"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { LikeButton } from "@/components/like-button"
import { CommentSection } from "@/components/comment-section"
import { ArrowLeft, Eye, Heart } from "lucide-react"
import { fetcher } from "@/lib/fetcher"

interface Translation {
  lang: string
  title: string
  content: string
}

interface NoteData {
  id: number
  nid: number
  view_count: number
  like_count: number
  created_at: string
  translations: Translation[]
}

export default function NoteDetailPage() {
  const params = useParams()
  const nid = params?.nid as string
  const { locale, t } = useI18n()

  const { data, isLoading } = useSWR(
    nid ? `/api/notes/${nid}` : null,
    fetcher
  )

  const note: NoteData | null = data?.data || null

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="animate-pulse glass-card p-8">
          <div className="h-7 w-2/3 rounded bg-muted" />
          <div className="mt-4 h-4 w-24 rounded bg-muted" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        </div>
      </main>
    )
  }

  if (!note) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-muted-foreground">
          {locale === "zh" ? "\u624b\u8bb0\u672a\u627e\u5230" : "Note not found"}
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.backHome")}
        </Link>
      </main>
    )
  }

  const translation = note.translations.find((t) => t.lang === locale) ||
    note.translations[0]

  if (!translation) return null

  return (
    <main className="mx-auto max-w-2xl px-6">
      <article className="py-8 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("blog.back")}
        </Link>

        <div className="glass-card mt-6 p-6 md:p-8">
          <header>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {locale === "zh" ? "\u624b\u8bb0" : "Note"}
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-mono font-semibold text-muted-foreground">
                {note.nid}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground text-balance md:text-2xl">
              {translation.title}
            </h1>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <time>
                {new Date(note.created_at).toLocaleDateString(
                  locale === "zh" ? "zh-CN" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </time>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {note.view_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {note.like_count || 0}
              </span>
            </div>
          </header>

          <div className="mt-8 border-t border-border pt-8">
            <MarkdownRenderer content={translation.content} />
          </div>

          {/* Like button */}
          <div className="mt-8 flex items-center border-t border-border pt-6">
            <LikeButton articleType="note" articleId={note.id} />
          </div>
        </div>

        {/* Comments */}
        <CommentSection articleType="note" articleId={note.id} />
      </article>
    </main>
  )
}
