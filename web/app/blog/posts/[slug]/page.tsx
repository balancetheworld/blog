import { notFound } from "next/navigation"
import Link from "next/link"
import { store } from "@/lib/store"
import { formatDate } from "@/lib/format"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { LikeButton } from "@/components/like-button"
import { CommentsSection } from "@/components/comments-section"
import { ViewCounter } from "@/components/view-counter"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await store.getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回首页
      </Link>

      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <time dateTime={new Date(post.createdAt).toISOString()}>{formatDate(post.createdAt)}</time>
          <span>·</span>
          <ViewCounter postId={post.id} initialViews={post.views} />
          {(post.tags?.length || 0) > 0 && (
            <>
              <span>·</span>
              <div className="flex flex-wrap gap-2">
                {post.tags?.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground">
          {post.title}
        </h1>
      </header>

      <MarkdownRenderer content={post.content} />

      <footer className="mt-12 border-t border-border pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LikeButton postId={post.id} initialLikes={post.likes} />
            <p className="text-sm text-muted-foreground">
              最后更新于 {formatDate(post.updatedAt)}
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
          >
            查看更多文章
          </Link>
        </div>
      </footer>

      <CommentsSection postId={post.id} />
    </article>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = await store.getPostBySlug(slug)

  if (!post) {
    return { title: "文章不存在" }
  }

  return {
    title: `${post.title} - 我的博客`,
    description: post.excerpt,
  }
}
