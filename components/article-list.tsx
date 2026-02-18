"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import useSWR from "swr"
import { FileText, BookOpen, ArrowRight, Calendar, Eye, Heart, Clock, Flame, Search, X, Tag } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Article {
  id: number
  slug?: string
  nid?: number
  title: string
  summary: string
  category: string
  type: "post" | "note"
  href: string
  created_at: string
  view_count: number
  like_count: number
  tags?: string[]
  cover_image?: string | null
}

interface Category {
  id: number
  slug: string
  name_en: string
  name_zh: string
}

function formatDate(date: string) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function ArticlesSection() {
  const { locale, t } = useI18n()
  const [activeCategory, setActiveCategory] = useState("")
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest")
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: catData } = useSWR("/api/categories", fetcher)
  const categories: Category[] = catData?.data || []

  const queryParams = new URLSearchParams({ lang: locale, sort: sortBy })
  if (activeCategory) queryParams.set("category", activeCategory)
  if (searchQuery) queryParams.set("q", searchQuery)

  const { data, isLoading } = useSWR(`/api/articles?${queryParams.toString()}`, fetcher)
  const articles: Article[] = data?.data || []
  const isSearching = searchQuery.length > 0



  return (
    <section className="pb-12">
      {/* Header: title + sort toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {t("section.articles")}
          </h2>
          {mounted && !isLoading && (
            <span className="text-xs text-muted-foreground">
              {isSearching
                ? `(${articles.length} ${locale === "zh" ? "\u4e2a\u7ed3\u679c" : articles.length === 1 ? "result" : "results"})`
                : `(${articles.length})`}
            </span>
          )}
        </div>

        {/* Sort toggle */}
        {mounted && (
          <div className="flex items-center rounded-full border border-border bg-background/50 p-0.5">
            <button
              onClick={() => setSortBy("latest")}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                sortBy === "latest"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3 w-3" />
              {locale === "zh" ? "\u6700\u65b0" : "Latest"}
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                sortBy === "popular"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="h-3 w-3" />
              {locale === "zh" ? "\u70ed\u95e8" : "Popular"}
            </button>
          </div>
        )}
      </div>

      {/* Search bar */}
      {mounted && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("common.search.placeholder")}
            className="w-full rounded-xl border border-border bg-background/50 py-2.5 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearchQuery("") }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Category filter tabs */}
      {mounted && (
        <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === ""
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t("category.all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat.slug
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {locale === "zh" ? cat.name_zh : cat.name_en}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {(!mounted || isLoading) && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card animate-pulse p-5">
              <div className="h-5 w-3/5 rounded bg-muted mb-3" />
              <div className="h-3 w-full rounded bg-muted mb-2" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {mounted && !isLoading && articles.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center py-16">
          {isSearching ? (
            <>
              <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{t("common.noResults")}</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {locale === "zh" ? `\u627e\u4e0d\u5230\u5305\u542b "${searchQuery}" \u7684\u6587\u7ae0` : `No articles found for "${searchQuery}"`}
              </p>
            </>
          ) : (
            <>
              <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{t("blog.empty")}</p>
            </>
          )}
        </div>
      )}

      {/* Article cards */}
      {mounted && !isLoading && articles.length > 0 && (
        <div className="flex flex-col gap-4">
          {articles.map((article) => {
            const TypeIcon = article.type === "note" ? BookOpen : FileText
            return (
              <Link
                key={`${article.type}-${article.id}`}
                href={article.href}
                className="glass-card group block overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Cover image */}
                {article.cover_image && (
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={article.cover_image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className={article.cover_image ? "p-5 pt-4" : "p-5"}>
                {/* Top row: type badge + date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-3.5 w-3.5 text-primary/70" />
                    <span className="text-xs font-medium text-primary/70 uppercase tracking-wider">
                      {article.type === "note"
                        ? locale === "zh" ? "\u624b\u8bb0" : "Note"
                        : article.category || (locale === "zh" ? "\u6587\u7ae0" : "Post")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2 text-balance">
                  {article.title}
                </h3>

                {/* Summary */}
                {article.summary && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                    {article.summary}
                  </p>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom row: stats + read more */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {formatCount(article.view_count || 0)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      {formatCount(article.like_count || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary/70 group-hover:text-primary transition-colors">
                    <span>{t("blog.readMore")}</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
