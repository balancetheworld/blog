"use client"

import useSWR from "swr"
import { useI18n } from "@/lib/i18n-context"
import { fetcher } from "@/lib/fetcher"

interface RecentlyItem {
  id: number
  content: string
  image_url?: string | null
  created_at: string
}

export default function RecentlyPage() {
  const { locale, t } = useI18n()
  const { data, isLoading } = useSWR("/api/recently", fetcher)
  const items: RecentlyItem[] = data?.data || []

  return (
    <main className="mx-auto max-w-2xl px-6 pb-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
        {t("section.recently")}
      </h1>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

        <div className="flex flex-col gap-6">
          {isLoading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse pl-9">
                  <div className="glass-card p-4">
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="mt-2 h-3 w-24 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </>
          )}
          {items.map((item) => (
            <div key={item.id} className="relative pl-9">
              {/* Timeline dot */}
              <div className="absolute left-1.5 top-4 h-3 w-3 rounded-full border-2 border-primary bg-background" />

              <div className="glass-card p-4 transition-all hover:shadow-md overflow-hidden">
                {item.image_url && (
                  <div className="mb-3 overflow-hidden rounded-md -mx-1 -mt-1">
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-full object-cover max-h-56 rounded-md"
                    />
                  </div>
                )}
                <p className="text-sm leading-relaxed text-foreground/85">
                  {item.content}
                </p>
                <time className="mt-2 block text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString(
                    locale === "zh" ? "zh-CN" : "en-US",
                    { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                  )}
                </time>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
