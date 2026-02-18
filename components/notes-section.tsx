"use client"

import Link from "next/link"
import useSWR from "swr"
import { BookOpen } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { SectionHeader } from "./section-header"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Note {
  id: number
  nid: number
  title: string
  content: string
  created_at: string
}

export function NotesSection() {
  const { locale, t } = useI18n()
  const { data, isLoading } = useSWR(`/api/notes?lang=${locale}`, fetcher)
  const notes: Note[] = data?.data || []

  return (
    <section className="glass-card p-5">
      <SectionHeader
        title={t("section.notes")}
        icon={BookOpen}
        linkText={t("section.notes.viewAll")}
        linkHref="/notes"
      />
      <div className="mt-4 flex flex-col">
        {isLoading && (
          <div className="flex flex-col gap-3 py-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-border p-3">
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="mt-2 h-3 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        )}
        {notes.slice(0, 5).map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.nid}`}
            className="group flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 -mx-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-mono text-muted-foreground">
                {note.nid}
              </span>
              <span className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {note.title}
              </span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {new Date(note.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
