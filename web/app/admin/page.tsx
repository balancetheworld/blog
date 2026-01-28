"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import type { Post } from "@/lib/store"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminPage() {
  const { data: posts, isLoading } = useSWR<Post[]>("/api/posts/admin", fetcher)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这篇文章吗？")) return

    setDeleting(id)
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" })
      mutate("/api/posts/admin")
    } finally {
      setDeleting(null)
    }
  }

  async function handleTogglePublish(post: Post) {
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    })
    mutate("/api/posts/admin")
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
          <h1 className="text-3xl font-bold tracking-tight">文章管理</h1>
          <p className="mt-1 text-muted-foreground">
            管理和编辑你的博客文章
          </p>
        </div>
        <Link href="/admin/new">
          <Button>
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建文章
          </Button>
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">暂无文章</p>
            <Link href="/admin/new">
              <Button>创建第一篇文章</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>所有文章 ({posts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium">{post.title}</h3>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "已发布" : "草稿"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      创建于 {formatDate(post.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(post)}
                    >
                      {post.published ? "取消发布" : "发布"}
                    </Button>
                    <Link href={`/admin/edit/${post.id}`}>
                      <Button variant="outline" size="sm">
                        编辑
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                    >
                      {deleting === post.id ? "删除中..." : "删除"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
