"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import {
  FileText, MessageCircle, Plus, Pencil, Trash2,
  LogOut, Loader2, ChevronDown, ChevronUp, Eye, Code, X, Tag, ImageIcon
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { MarkdownRenderer } from "@/components/markdown-renderer"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// --- Article Editor Dialog ---
function ArticleEditor({
  article,
  onClose,
  onSaved,
}: {
  article?: Record<string, unknown> | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!article
  const [type, setType] = useState<string>((article?.type as string) || "post")
  const [slug, setSlug] = useState((article?.slug as string) || "")
  const [category, setCategory] = useState((article?.category as string) || "")
  const [coverImage, setCoverImage] = useState((article?.cover_image as string) || "")
  const [titleEn, setTitleEn] = useState((article?.title_en as string) || "")
  const [summaryEn, setSummaryEn] = useState((article?.summary_en as string) || "")
  const [contentEn, setContentEn] = useState((article?.content_en as string) || "")
  const [titleZh, setTitleZh] = useState((article?.title_zh as string) || "")
  const [summaryZh, setSummaryZh] = useState((article?.summary_zh as string) || "")
  const [contentZh, setContentZh] = useState((article?.content_zh as string) || "")
  const [articleTags, setArticleTags] = useState<string[]>((article?.tags as string[]) || [])
  const [tagInput, setTagInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [langTab, setLangTab] = useState<"en" | "zh">("zh")
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit")

  const { data: catData } = useSWR("/api/categories", fetcher)
  const categories: { slug: string; name_en: string; name_zh: string }[] = catData?.data || []

  // Auto-select first category when data loads and no category is set
  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0].slug)
    }
  }, [category, categories])

  const currentContent = langTab === "en" ? contentEn : contentZh
  const currentTitle = langTab === "en" ? titleEn : titleZh
  const currentSummary = langTab === "en" ? summaryEn : summaryZh

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      type,
      slug,
      category,
      cover_image: coverImage || null,
      tags: articleTags,
      title_en: titleEn, summary_en: summaryEn, content_en: contentEn,
      title_zh: titleZh, summary_zh: summaryZh, content_zh: contentZh,
    }

    const url = isEdit
      ? `/api/admin/articles/${article.id}`
      : "/api/admin/articles"
    const method = isEdit ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        alert(`Failed to save: ${data.error || res.statusText}`)
        setSaving(false)
        return
      }

      setSaving(false)
      onSaved()
      onClose()
    } catch {
      alert("Network error when saving article")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-foreground/20 backdrop-blur-sm pt-10 pb-10">
      <div className="glass-card mx-4 w-full max-w-3xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {isEdit ? "Edit Article" : "New Article"}
        </h2>

        {/* Type selector (only for new) */}
        {!isEdit && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setType("post")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${type === "post" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              Post
            </button>
            <button
              onClick={() => setType("note")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${type === "note" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              Note
            </button>
          </div>
        )}

        {/* Slug + Category (posts only) */}
        {type === "post" && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary" placeholder="my-post-slug" />
            </div>
            <div className="flex flex-col gap-1">
  <label className="text-xs font-medium text-muted-foreground">Category</label>
  <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary">
    {categories.length === 0 && <option value="default">default</option>}
    {categories.map((cat) => (
      <option key={cat.slug} value={cat.slug}>{cat.name_zh} ({cat.name_en})</option>
    ))}
  </select>
            </div>
          </div>
        )}

        {/* Cover image (posts only) */}
        {type === "post" && (
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              Cover Image URL
            </label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="https://example.com/cover.jpg"
            />
            {coverImage && (
              <div className="relative mt-1 overflow-hidden rounded-lg border border-border">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-32 w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              </div>
            )}
          </div>
        )}

        {/* Tags input (posts only) */}
        {type === "post" && (
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tags</label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background/50 px-2 py-1.5 min-h-[38px]">
              {articleTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => setArticleTags(articleTags.filter((t) => t !== tag))}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                    e.preventDefault()
                    const newTag = tagInput.trim().replace(/,/g, "")
                    if (newTag && !articleTags.includes(newTag)) {
                      setArticleTags([...articleTags, newTag])
                    }
                    setTagInput("")
                  } else if (e.key === "Backspace" && !tagInput && articleTags.length > 0) {
                    setArticleTags(articleTags.slice(0, -1))
                  }
                }}
                className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 py-0.5"
                placeholder={articleTags.length === 0 ? "Type and press Enter to add tags..." : "Add more..."}
              />
            </div>
          </div>
        )}

        {/* Language tabs + edit/preview toggle */}
        <div className="mb-3 flex items-center justify-between border-b border-border">
          <div className="flex gap-2">
            <button onClick={() => setLangTab("zh")} className={`px-3 py-2 text-xs font-medium transition-colors ${langTab === "zh" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Chinese</button>
            <button onClick={() => setLangTab("en")} className={`px-3 py-2 text-xs font-medium transition-colors ${langTab === "en" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>English</button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setEditorMode("edit")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${editorMode === "edit" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Code className="h-3 w-3" />
              Edit
            </button>
            <button
              onClick={() => setEditorMode("preview")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${editorMode === "preview" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Eye className="h-3 w-3" />
              Preview
            </button>
          </div>
        </div>

        {/* Content fields */}
        {editorMode === "edit" ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <input
                value={langTab === "en" ? titleEn : titleZh}
                onChange={(e) => langTab === "en" ? setTitleEn(e.target.value) : setTitleZh(e.target.value)}
                className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Article title..."
              />
            </div>
            {type === "post" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Summary</label>
                <input
                  value={langTab === "en" ? summaryEn : summaryZh}
                  onChange={(e) => langTab === "en" ? setSummaryEn(e.target.value) : setSummaryZh(e.target.value)}
                  className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Brief summary..."
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Content (Markdown)</label>
              <textarea
                value={langTab === "en" ? contentEn : contentZh}
                onChange={(e) => langTab === "en" ? setContentEn(e.target.value) : setContentZh(e.target.value)}
                rows={14}
                className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary font-mono resize-y"
                placeholder="Write your content in Markdown..."
              />
            </div>
          </div>
        ) : (
          /* Preview mode */
          <div className="rounded-lg border border-border bg-background/50 p-5 min-h-[300px]">
            {currentTitle && (
              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2 text-balance">
                {currentTitle}
              </h1>
            )}
            {currentSummary && (
              <p className="text-sm text-muted-foreground mb-6 italic">{currentSummary}</p>
            )}
            {currentContent ? (
              <MarkdownRenderer content={currentContent} />
            ) : (
              <p className="text-sm text-muted-foreground italic">No content to preview yet...</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? "Save Changes" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Recently Editor ---
function RecentlyEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/recently", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, image_url: imageUrl || null }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(`Failed to save: ${data.error || res.statusText}`)
        setSaving(false)
        return
      }
      setSaving(false)
      onSaved()
      onClose()
    } catch {
      alert("Network error")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="glass-card mx-4 w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">New Thought</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary resize-y"
          placeholder="What's on your mind..."
          autoFocus
        />
        <div className="mt-3 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            Image URL (optional)
          </label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="https://example.com/photo.jpg"
          />
          {imageUrl && (
            <div className="mt-1 overflow-hidden rounded-lg border border-border">
              <img
                src={imageUrl}
                alt="Preview"
                className="h-28 w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !content.trim()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Main Admin Page ---
export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, isLoading: authLoading, logout } = useAuth()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<"articles" | "recently">("articles")
  const [editingArticle, setEditingArticle] = useState<Record<string, unknown> | null>(null)
  const [showNewArticle, setShowNewArticle] = useState(false)
  const [showNewRecently, setShowNewRecently] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: articlesData, mutate: mutateArticles } = useSWR(
    isAuthenticated ? "/api/admin/articles" : null,
    fetcher
  )
  const { data: recentlyData, mutate: mutateRecently } = useSWR(
    isAuthenticated ? "/api/admin/recently" : null,
    fetcher
  )

  const articles = articlesData?.data || []
  const recentlyItems = recentlyData?.data || []

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.replace(isAuthenticated ? "/" : "/login")
    }
  }, [authLoading, isAuthenticated, isAdmin, router])

  if (authLoading || (!isAuthenticated || !isAdmin)) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    )
  }

  const handleDeleteArticle = async (id: number, type: string) => {
    if (!confirm("Are you sure you want to delete this?")) return
    const res = await fetch(`/api/admin/articles/${id}?type=${type}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) alert(`Delete failed: ${data.error || res.statusText}`)
    mutateArticles()
  }

  const handleDeleteRecently = async (id: number) => {
    if (!confirm("Delete this thought?")) return
    const res = await fetch(`/api/admin/recently/${id}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) alert(`Delete failed: ${data.error || res.statusText}`)
    mutateRecently()
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <main className="mx-auto max-w-2xl px-6 pb-12">
      {/* Admin Header */}
      <div className="mb-8 flex items-center justify-between pt-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("admin.dashboard") || "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.welcome") || "Welcome"}, {user?.displayName}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t("admin.logout") || "Logout"}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-muted/50 p-1">
        <button
          onClick={() => setActiveTab("articles")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === "articles" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <FileText className="h-3.5 w-3.5" />
          {t("admin.articles") || "Articles"} ({articles.length})
        </button>
        <button
          onClick={() => setActiveTab("recently")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === "recently" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {t("admin.recently") || "Thoughts"} ({recentlyItems.length})
        </button>
      </div>

      {/* Articles Tab */}
      {activeTab === "articles" && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowNewArticle(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              New Article
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {articles.map((a: Record<string, unknown>) => {
              const key = `${a.type}-${a.id}`
              const isOpen = expandedId === key
              return (
                <div key={key} className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : key)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${a.type === "note" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-primary/10 text-primary"}`}>
                            {a.type as string}
                          </span>
                          <span className="text-sm font-medium text-foreground truncate">
                            {(a.title_zh as string) || (a.title_en as string) || "Untitled"}
                          </span>
                        </div>
                        {a.slug && (
                          <span className="text-xs text-muted-foreground">/{a.slug as string}</span>
                        )}
                      </div>
                    </button>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => setEditingArticle(a)}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(a.id as number, a.type as string)}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                      <div className="grid grid-cols-2 gap-2">
                        <div><span className="font-medium">EN:</span> {(a.title_en as string) || "-"}</div>
                        <div><span className="font-medium">ZH:</span> {(a.title_zh as string) || "-"}</div>
                      </div>
                      {a.category && <div className="mt-1">Category: {a.category as string}</div>}
                      {Array.isArray(a.tags) && (a.tags as string[]).length > 0 && (
                        <div className="mt-1 flex items-center gap-1 flex-wrap">
                          <span className="font-medium">Tags:</span>
                          {(a.tags as string[]).map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              <Tag className="h-2 w-2" />{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-1">Created: {new Date(a.created_at as string).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              )
            })}
            {articles.length === 0 && (
              <div className="glass-card flex items-center justify-center py-12 text-sm text-muted-foreground">
                No articles yet. Create your first one!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recently Tab */}
      {activeTab === "recently" && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowNewRecently(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              New Thought
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recentlyItems.map((item: Record<string, unknown>) => (
              <div key={item.id as number} className="glass-card flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{item.content as string}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(item.created_at as string).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteRecently(item.id as number)}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {recentlyItems.length === 0 && (
              <div className="glass-card flex items-center justify-center py-12 text-sm text-muted-foreground">
                No thoughts yet. Share what is on your mind!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editors */}
      {showNewArticle && (
        <ArticleEditor onClose={() => setShowNewArticle(false)} onSaved={() => mutateArticles()} />
      )}
      {editingArticle && (
        <ArticleEditor article={editingArticle} onClose={() => setEditingArticle(null)} onSaved={() => mutateArticles()} />
      )}
      {showNewRecently && (
        <RecentlyEditor onClose={() => setShowNewRecently(false)} onSaved={() => mutateRecently()} />
      )}
    </main>
  )
}
