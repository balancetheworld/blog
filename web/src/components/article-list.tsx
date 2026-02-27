// "use client"：声明该文件为 Next.js 客户端组件
// 因为使用了 useState/useEffect/useSWR 等客户端专属 Hooks，无法在服务端渲染
"use client"

// 导入 React 核心 Hooks：
import { useState, useEffect } from "react"
// 导入 Next.js 链接组件：实现客户端无刷新导航
import Link from "next/link"
// 导入 SWR：React 数据请求+缓存库（自动处理加载/缓存/重新验证）
import useSWR from "swr"
// 导入 Lucide 图标库：文章列表使用的各类功能图标
import { FileText, ArrowRight, Calendar, Eye, Heart, Clock, Flame, Search, X, Tag, Pin } from "lucide-react"
// 导入自定义国际化上下文：实现多语言文案切换（中/英文）
import { useI18n } from "@/lib/i18n-context"
// 导入通用请求工具：供 useSWR 使用的请求器（封装 fetch/axios）
import { fetcher } from "@/lib/fetcher"

// ========== TypeScript 类型定义 ==========
// 定义文章数据结构：约束后端返回的文章数据格式
interface Article {
  id: number                          // 文章唯一ID（必填）
  slug?: string                       // 文章URL标识（可选，用于 /article/{slug} 路由）
  nid?: number                        // 笔记ID（可选，用于 /notes/{nid} 路由，兼容笔记类型）
  category: string                    // 文章分类标识（如 tech/front-end）
  created_at: string                  // 创建时间（ISO格式字符串，如 2026-02-26T12:00:00Z）
  view_count: number                  // 阅读量
  like_count: number                  // 点赞数
  is_pinned?: number                  // 是否置顶（可选，1=置顶，0=不置顶）
  tags?: string[]                     // 文章标签（可选，数组）
  cover_image?: string | null         // 封面图片URL（可选，null 表示无）
  translations: Array<{               // 多语言翻译内容（核心字段）
    lang: string                      // 语言标识（如 zh/en）
    title: string                     // 对应语言的标题
    summary: string                   // 对应语言的摘要
    content: string                   // 对应语言的正文
  }>
}

// ========== 工具函数 1：生成文章跳转链接 ==========
// 根据文章类型生成跳转链接（优先用 slug，兜底用 nid）
function getArticleHref(article: Article): string {
  if (article.slug) {
    return `/article/${article.slug}` // 文章：使用 slug 跳转（URL友好）
  }
  // 笔记：兼容旧的 nid 路由（备用逻辑）
  if (article.nid) {
    return `/notes/${article.nid}`
  }
  return '#' // 兜底：无有效标识时返回空链接
}

// ========== 类型定义：分类数据结构 ==========
interface Category {
  id: number               // 分类ID
  slug: string             // 分类URL标识（如 tech）
  name_en: string          // 分类英文名称
  name_zh: string          // 分类中文名称
}

// ========== 工具函数 2：格式化日期 ==========
// 将 ISO 时间字符串格式化为 YYYY-MM-DD 格式（如 2026-02-26）
function formatDate(date: string) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0") // 月份补零（如 2 → 02）
  const day = String(d.getDate()).padStart(2, "0")    // 日期补零（如 5 → 05）
  return `${y}-${m}-${day}`
}

// ========== 工具函数 3：格式化数字（阅读量/点赞数） ==========
// 大数简化显示（如 1200 → 1.2k，999 → 999）
function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k` // 千位以上保留1位小数，加k
  return String(n) // 千位以下直接转字符串
}

// ========== 工具函数 4：根据语言获取文章标题 ==========
// 优先取当前语言的标题，兜底取第一个翻译项的标题，最后显示 "Untitled"
function getArticleTitle(article: Article, locale: string): string {
  const trans = article.translations?.find((t) => t.lang === locale)
  return trans?.title || article.translations?.[0]?.title || "Untitled"
}

// ========== 工具函数 5：根据语言获取文章摘要 ==========
// 逻辑同标题，兜底返回空字符串
function getArticleSummary(article: Article, locale: string): string {
  const trans = article.translations?.find((t) => t.lang === locale)
  return trans?.summary || article.translations?.[0]?.summary || ""
}

// ========== 文章列表主组件 ==========
export function ArticlesSection() {
  // 获取国际化上下文：locale（当前语言 zh/en）、t（翻译函数）
  const { locale, t } = useI18n()
  
  // ========== 状态管理 ==========
  const [activeCategory, setActiveCategory] = useState("") // 当前选中的分类（空字符串表示全部）
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest") // 排序方式：最新/热门
  const [searchInput, setSearchInput] = useState("") // 搜索框输入值（实时更新）
  const [searchQuery, setSearchQuery] = useState("") // 实际请求的搜索关键词（防抖后）
  const [mounted, setMounted] = useState(false) // 标记组件是否已挂载（避免服务端/客户端渲染不一致）

  // 组件挂载后设置 mounted 为 true（解决 Hydration 警告）
  useEffect(() => { setMounted(true) }, [])

  // 搜索输入防抖：300ms 内无输入变化才更新搜索关键词（避免频繁请求）
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 300)
    return () => clearTimeout(timer) // 组件卸载/输入变化时清除定时器
  }, [searchInput])

  // ========== 数据请求 ==========
  // 1. 请求分类列表数据：用于分类筛选标签
  const { data: catData } = useSWR("/api/categories", fetcher)
  const categories: Category[] = catData?.data || [] // 格式化分类数据，兜底为空数组

  // 2. 构建文章列表请求参数：根据筛选条件动态拼接
  const queryParams = new URLSearchParams({ 
    lang: locale,    // 语言：只返回当前语言的文章
    sort: sortBy     // 排序：latest/popular
  })
  if (activeCategory) queryParams.set("category", activeCategory) // 分类筛选：有选中时添加
  if (searchQuery) queryParams.set("q", searchQuery)               // 搜索关键词：有值时添加

  // 3. 请求文章列表数据：根据拼接的参数动态请求
  const { data, isLoading } = useSWR(`/api/articles?${queryParams.toString()}`, fetcher)
  const articles: Article[] = data?.data || [] // 格式化文章数据，兜底为空数组
  const isSearching = searchQuery.length > 0   // 是否处于搜索状态（有搜索关键词）

  // ========== UI 渲染 ==========
  return (
    <section className="pb-12"> {/* 文章列表外层容器，底部内边距 */}
      {/* 头部：标题 + 排序切换 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-primary" /> {/* 文章图标 */}
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {t("section.articles")} {/* 多语言标题（如「文章」/「Articles」） */}
          </h2>
          {/* 显示文章数量统计（组件挂载且非加载状态时显示） */}
          {mounted && !isLoading && (
            <span className="text-xs text-muted-foreground">
              {isSearching
                ? `(${articles.length} ${locale === "zh" ? "\u4e2a\u7ed3\u679c" : articles.length === 1 ? "result" : "results"})`
                : `(${articles.length})`}
            </span>
          )}
        </div>

        {/* 排序切换按钮（组件挂载后显示） */}
        {mounted && (
          <div className="flex items-center rounded-full border border-border bg-background/50 p-0.5">
            {/* 最新排序按钮 */}
            <button
              onClick={() => setSortBy("latest")}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                sortBy === "latest"
                  ? "bg-primary text-primary-foreground shadow-sm" // 激活状态
                  : "text-muted-foreground hover:text-foreground"  // 普通/悬浮状态
              }`}
            >
              <Clock className="h-3 w-3" /> {/* 时钟图标 */}
              {locale === "zh" ? "\u6700\u65b0" : "Latest"}
            </button>
            {/* 热门排序按钮 */}
            <button
              onClick={() => setSortBy("popular")}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                sortBy === "popular"
                  ? "bg-primary text-primary-foreground shadow-sm" // 激活状态
                  : "text-muted-foreground hover:text-foreground"  // 普通/悬浮状态
              }`}
            >
              <Flame className="h-3 w-3" /> {/* 火焰图标 */}
              {locale === "zh" ? "\u70ed\u95e8" : "Popular"}
            </button>
          </div>
        )}
      </div>

      {/* 搜索框（组件挂载后显示） */}
      {mounted && (
        <div className="relative mb-4">
          {/* 搜索图标（绝对定位，不可点击） */}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput} // 绑定输入框值
            onChange={(e) => setSearchInput(e.target.value)} // 实时更新输入状态
            placeholder={t("common.search.placeholder")} // 多语言占位符（如「搜索文章」/「Search articles」）
            className="w-full rounded-xl border border-border bg-background/50 py-2.5 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          {/* 清空搜索按钮（有输入时显示） */}
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearchQuery("") }} // 清空输入和搜索关键词
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" /> {/* 关闭图标 */}
            </button>
          )}
        </div>
      )}

      {/* 分类筛选标签（组件挂载后显示） */}
      {mounted && (
        <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* 全部分类按钮 */}
          <button
            onClick={() => setActiveCategory("")} // 清空选中分类
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === ""
                ? "bg-primary text-primary-foreground shadow-sm" // 激活状态
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted" // 普通/悬浮状态
            }`}
          >
            {t("category.all")} {/* 多语言「全部」 */}
          </button>
          {/* 遍历分类列表生成筛选按钮 */}
          {categories.map((cat) => (
            <button
              key={cat.slug} // 唯一key（用slug避免重复）
              onClick={() => setActiveCategory(cat.slug)} // 选中当前分类
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat.slug
                  ? "bg-primary text-primary-foreground shadow-sm" // 激活状态
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted" // 普通/悬浮状态
              }`}
            >
              {locale === "zh" ? cat.name_zh : cat.name_en} {/* 根据语言显示分类名称 */}
            </button>
          ))}
        </div>
      )}

      {/* 加载中骨架屏（组件未挂载或加载中显示） */}
      {(!mounted || isLoading) && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card animate-pulse p-5">
              <div className="h-5 w-3/5 rounded bg-muted mb-3" /> {/* 标题占位 */}
              <div className="h-3 w-full rounded bg-muted mb-2" /> {/* 摘要行1占位 */}
              <div className="h-3 w-2/3 rounded bg-muted" />      {/* 摘要行2占位 */}
            </div>
          ))}
        </div>
      )}

      {/* 空状态（挂载完成、非加载、无文章时显示） */}
      {mounted && !isLoading && articles.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center py-16">
          {isSearching ? (
            // 搜索无结果状态
            <>
              <Search className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{t("common.noResults")}</p> {/* 「无搜索结果」 */}
              <p className="mt-1 text-xs text-muted-foreground/60">
                {locale === "zh" ? `\u627e\u4e0d\u5230\u5305\u542b "${searchQuery}" \u7684\u6587\u7ae0` : `No articles found for "${searchQuery}"`}
              </p>
            </>
          ) : (
            // 无文章状态
            <>
              <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{t("blog.empty")}</p> {/* 「暂无文章」 */}
            </>
          )}
        </div>
      )}

      {/* 文章列表卡片（挂载完成、非加载、有文章时显示） */}
      {mounted && !isLoading && articles.length > 0 && (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <Link
              key={`post-${article.id}`}
              href={getArticleHref(article)}
              className="glass-card group block overflow-hidden relative"
            >
                {/* 背景图片层（仅在有封面图时显示） */}
                {article.cover_image && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${article.cover_image})` }}
                    />
                    {/* 渐变遮罩层 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70 pointer-events-none" />
                  </>
                )}

                {/* 文章内容区域 */}
                <div className="relative z-10 p-5">
                {/* 顶部行：分类标签 + 创建时间 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className={`h-3.5 w-3.5 ${article.cover_image ? 'text-white/80' : 'text-primary/70'}`} />
                    <span className={`text-xs font-medium uppercase tracking-wider ${article.cover_image ? 'text-white/90' : 'text-primary/70'}`}>
                      {article.category || (locale === "zh" ? "文章" : "Post")}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${article.cover_image ? 'text-white/70' : 'text-muted-foreground'}`}>
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                </div>

                {/* 文章标题 */}
                <div className="flex items-start gap-2 mb-2">
                  <h3 className={`text-base font-semibold transition-colors text-balance flex-1 ${article.cover_image ? 'text-white group-hover:text-white/80' : 'text-foreground group-hover:text-primary'}`}>
                    {getArticleTitle(article, locale)}
                  </h3>
                  {/* 置顶标识 */}
                  {article.is_pinned === 1 && (
                    <Pin className={`h-4 w-4 shrink-0 fill-current ${article.cover_image ? 'text-amber-400' : 'text-amber-500'}`} />
                  )}
                </div>

                {/* 文章摘要 */}
                {getArticleSummary(article, locale) && (
                  <p className={`text-sm leading-relaxed line-clamp-2 mb-3 ${article.cover_image ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {getArticleSummary(article, locale)}
                  </p>
                )}

                {/* 文章标签 */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          article.cover_image
                            ? 'bg-white/20 text-white/90 backdrop-blur-sm'
                            : 'bg-muted/70 text-muted-foreground'
                        }`}
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 底部行：阅读/点赞数 + 阅读更多 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 text-xs ${article.cover_image ? 'text-white/70' : 'text-muted-foreground'}`}>
                      <Eye className="h-3 w-3" />
                      {formatCount(article.view_count || 0)}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${article.cover_image ? 'text-white/70' : 'text-muted-foreground'}`}>
                      <Heart className="h-3 w-3" />
                      {formatCount(article.like_count || 0)}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                    article.cover_image
                      ? 'text-white/90 group-hover:text-white'
                      : 'text-primary/70 group-hover:text-primary'
                  }`}>
                    <span>{t("blog.readMore")}</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </section>
  )
}