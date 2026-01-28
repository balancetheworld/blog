"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FolderPlus, Pencil, Trash2 } from "lucide-react"
import type { Category } from "@/lib/store"

const fetcher = (url: string) => fetch(url).then(res => res.json())

type CategoryWithCount = Category & { postCount: number }

export default function CategoriesPage() {
  const { data: categories, isLoading } = useSWR<CategoryWithCount[]>("/api/categories", fetcher)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")

  function resetForm() {
    setName("")
    setDescription("")
    setError("")
  }

  async function handleAdd() {
    if (!name.trim()) {
      setError("分类名称不能为空")
      return
    }

    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "创建失败")
        return
      }

      mutate("/api/categories")
      setIsAddOpen(false)
      resetForm()
    } catch {
      setError("创建失败，请稍后再试")
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit() {
    if (!editingCategory || !name.trim()) {
      setError("分类名称不能为空")
      return
    }

    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "更新失败")
        return
      }

      mutate("/api/categories")
      setEditingCategory(null)
      resetForm()
    } catch {
      setError("更新失败，请稍后再试")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个分类吗？该分类下的文章将变为无分类状态。")) return

    setDeleting(id)
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" })
      mutate("/api/categories")
    } finally {
      setDeleting(null)
    }
  }

  function openEditDialog(category: CategoryWithCount) {
    setEditingCategory(category)
    setName(category.name)
    setDescription(category.description || "")
    setError("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">分类管理</h1>
          <p className="mt-1 text-muted-foreground">
            管理博客文章的分类
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="mr-2 h-4 w-4" />
              新建分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建分类</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">分类名称</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="如：技术、生活"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述（可选）</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="简短描述这个分类"
                  className="h-20"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAdd} disabled={saving}>
                  {saving ? "创建中..." : "创建"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!categories || categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">暂无分类</p>
            <Button onClick={() => setIsAddOpen(true)}>创建第一个分类</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {category.postCount} 篇文章
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                      disabled={deleting === category.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {category.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 编辑对话框 */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => {
        if (!open) {
          setEditingCategory(null)
          resetForm()
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">分类名称</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="如：技术、生活"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">描述（可选）</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="简短描述这个分类"
                className="h-20"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingCategory(null)}>
                取消
              </Button>
              <Button onClick={handleEdit} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
