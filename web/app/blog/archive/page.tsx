/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-01-27 20:49:34
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-01-27 20:49:42
 * @FilePath: /blog/my-next-app/app/blog/archive/page.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Link from "next/link"
import { store } from "@/lib/store"
import { formatDateShort } from "@/lib/format"

export const metadata = {
  title: "归档 - 我的博客",
  description: "所有文章按时间归档",
}

export default async function ArchivePage() {
  const postsByYear = await store.getPostsByYear()
  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a))
  const totalPosts = Object.values(postsByYear).flat().length

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">文章归档</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          共 {totalPosts} 篇文章
        </p>
      </header>

      {years.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">暂无文章</p>
        </div>
      ) : (
        <div className="space-y-12">
          {years.map(year => (
            <section key={year}>
              <h2 className="mb-6 flex items-center gap-4 text-2xl font-semibold">
                <span>{year}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {postsByYear[year].length} 篇
                </span>
              </h2>

              <div className="border-l-2 border-border pl-6">
                <ul className="space-y-4">
                  {postsByYear[year].map(post => (
                    <li key={post.id} className="relative">
                      <div className="absolute -left-[1.625rem] top-2 h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
                      <Link
                        href={`/posts/${post.slug}`}
                        className="group flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4"
                      >
                        <time className="shrink-0 text-sm text-muted-foreground w-20">
                          {formatDateShort(post.createdAt)}
                        </time>
                        <span className="font-medium text-foreground transition-colors group-hover:text-foreground/70">
                          {post.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
