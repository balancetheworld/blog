"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import type { Post, Category } from "@/lib/store"

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface PostEditorProps {
  post?: Post
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const { data: categories } = useSWR<Category[]>("/api/categories", fetcher)
  const [title, setTitle] = useState(post?.title || "")
  const [content, setContent] = useState(post?.content || "")
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")
  const [tags, setTags] = useState(post?.tags?.join(", ") || "")
  const [categoryId, setCategoryId] = useState(post?.categoryId || "")
  const [published, setPublished] = useState(post?.published || false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const url = post ? `/api/posts/${post.id}` : "/api/posts"
      const method = post ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || content.substring(0, 150) + "...",
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          categoryId: categoryId || undefined,
          published,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "保存失败")
        return
      }

      router.push("/admin")
      router.refresh()
    } catch {
      setError("保存失败，请稍后再试")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{post ? "编辑文章" : "新建文章"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="请输入文章标题"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">内容 (支持 Markdown)</Label>
                <Tabs defaultValue="write" className="w-full">
                  <TabsList className="mb-2">
                    <TabsTrigger value="write">编辑</TabsTrigger>
                    <TabsTrigger value="preview">预览</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write" className="mt-0">
                    <Textarea
                      id="content"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="使用 Markdown 语法编写文章内容..."
                      className="min-h-[400px] font-mono text-sm"
                      required
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <div className="min-h-[400px] rounded-md border border-input bg-background p-4">
                      {content ? (
                        <MarkdownRenderer content={content} />
                      ) : (
                        <p className="text-muted-foreground">暂无内容</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>发布设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">发布状态</Label>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {published ? "文章将公开显示" : "文章将保存为草稿"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>文章信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="excerpt">摘要</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  placeholder="文章简短描述（可选）"
                  className="h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无分类</SelectItem>
                    {categories?.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">标签</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="用逗号分隔，如：技术, Next.js"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "保存中..." : "保存文章"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              取消
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
