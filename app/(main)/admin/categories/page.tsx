"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical, Save, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Category {
  id: number
  slug: string
  name_en: string
  name_zh: string
  sort_order: number
}

function CategoryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Category
  onSave: (data: { slug: string; name_en: string; name_zh: string; sort_order: number }) => Promise<void>
  onCancel: () => void
}) {
  const [slug, setSlug] = useState(initial?.slug || "")
  const [nameEn, setNameEn] = useState(initial?.name_en || "")
  const [nameZh, setNameZh] = useState(initial?.name_zh || "")
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!slug.trim() || !nameEn.trim() || !nameZh.trim()) return
    setSaving(true)
    await onSave({ slug: slug.trim(), name_en: nameEn.trim(), name_zh: nameZh.trim(), sort_order: sortOrder })
    setSaving(false)
  }

  return (
    <div className="glass-card p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. tech"
            disabled={!!initial}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">English Name</label>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Technology"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Chinese Name</label>
          <input
            value={nameZh}
            onChange={(e) => setNameZh(e.target.value)}
            placeholder="\u6280\u672f"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="h-3.5 w-3.5 inline mr-1" />
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || !slug.trim() || !nameEn.trim() || !nameZh.trim()}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5 inline mr-1" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()
  const { locale } = useI18n()
  const [showNew, setShowNew] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data, mutate } = useSWR("/api/admin/categories", fetcher)
  const categories: Category[] = data?.data || []

  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    router.replace(isAuthenticated ? "/" : "/login")
    return null
  }

  const handleCreate = async (formData: { slug: string; name_en: string; name_zh: string; sort_order: number }) => {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    const result = await res.json()
    if (!res.ok) {
      alert(result.error || "Failed to create")
      return
    }
    setShowNew(false)
    mutate()
  }

  const handleUpdate = async (id: number, formData: { slug: string; name_en: string; name_zh: string; sort_order: number }) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    const result = await res.json()
    if (!res.ok) {
      alert(result.error || "Failed to update")
      return
    }
    setEditingId(null)
    mutate()
  }

  const handleDelete = async (id: number) => {
    if (!confirm(locale === "zh" ? "\u786e\u5b9a\u5220\u9664\u8fd9\u4e2a\u5206\u7c7b\u5417\uff1f" : "Delete this category?")) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const result = await res.json()
      alert(result.error || "Failed to delete")
      return
    }
    mutate()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pt-24 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">
            {locale === "zh" ? "\u5206\u7c7b\u7ba1\u7406" : "Category Management"}
          </h1>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditingId(null) }}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {locale === "zh" ? "\u65b0\u589e" : "Add"}
        </button>
      </div>

      {/* New category form */}
      {showNew && (
        <div className="mb-6">
          <CategoryForm onSave={handleCreate} onCancel={() => setShowNew(false)} />
        </div>
      )}

      {/* Category list */}
      <div className="flex flex-col gap-3">
        {categories.map((cat) =>
          editingId === cat.id ? (
            <CategoryForm
              key={cat.id}
              initial={cat}
              onSave={(d) => handleUpdate(cat.id, d)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={cat.id}
              className="glass-card flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {locale === "zh" ? cat.name_zh : cat.name_en}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                      {cat.slug}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {locale === "zh" ? cat.name_en : cat.name_zh}
                    {" \u00B7 "}
                    {locale === "zh" ? "\u6392\u5e8f" : "Order"}: {cat.sort_order}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingId(cat.id); setShowNew(false) }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        )}

        {categories.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {locale === "zh" ? "\u8fd8\u6ca1\u6709\u5206\u7c7b\uff0c\u70b9\u51fb\u4e0a\u65b9\u201c\u65b0\u589e\u201d\u6309\u94ae\u521b\u5efa" : "No categories yet. Click \"Add\" to create one."}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
