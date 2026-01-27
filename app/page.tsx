import Link from "next/link"
import { store } from "@/lib/store"
import { formatDate } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HomePage() {
  const posts = await store.getAllPosts()

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-4xl font-bold tracking-tight">我的博客</h1>
          <p className="mt-2 text-muted-foreground">
            分享技术、生活和思考
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        {!posts || posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-2 text-muted-foreground">暂无文章</p>
              <p className="text-sm text-muted-foreground">
                敬请期待精彩内容
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={`/blog/posts/${post.slug}`}>
                        <CardTitle className="hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <time dateTime={new Date(post.createdAt).toISOString()}>
                          {formatDate(post.createdAt)}
                        </time>
                        {post.category && (
                          <>
                            <span>·</span>
                            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                              {post.category.name}
                            </span>
                          </>
                        )}
                        {(post.tags?.length || 0) > 0 && (
                          <>
                            <span>·</span>
                            <div className="flex flex-wrap gap-1.5">
                              {post.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {post.excerpt && (
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-background mt-12">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 我的博客. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
