"use client"

import useSWR from "swr"
import { MessageCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { SectionHeader } from "./section-header"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface RecentlyItem {
  id: number
  content: string
  image_url?: string | null
  created_at: string
}

export function RecentlySection() {
  const { locale, t } = useI18n()
  const { data, isLoading } = useSWR("/api/recently", fetcher)
  const items: RecentlyItem[] = data?.data || []

  return (
    <section className="glass-card p-5">
      <SectionHeader
        title={t("section.recently")}
        icon={MessageCircle}
        linkText={t("section.recently.viewAll")}
        linkHref="/recently"
      />
      <div className="mt-4 flex flex-col gap-3">
        {isLoading && (
          <div className="flex flex-col gap-3 py-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-border p-3">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="mt-2 h-3 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        )}
        {items.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-border/60 bg-background/50 p-3.5 transition-colors hover:border-border"
          >
            {item.image_url && (
              <div className="mb-2.5 overflow-hidden rounded-md">
                <img
                  src={item.image_url}
                  alt=""
                  className="w-full object-cover max-h-48 rounded-md"
                />
              </div>
            )}
            <p className="text-sm leading-relaxed text-foreground/85">
              {item.content}
            </p>
            <time className="mt-2 block text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString(
                locale === "zh" ? "zh-CN" : "en-US",
                { year: "numeric", month: "short", day: "numeric" }
              )}
            </time>
          </div>
        ))}
      </div>
    </section>
  )
}
