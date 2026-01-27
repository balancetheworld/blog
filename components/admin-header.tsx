/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-01-27 21:04:56
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-01-27 21:05:04
 * @FilePath: /blog/my-next-app/components/admin-header.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function AdminHeader() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <span className="text-sm font-bold">B</span>
            </div>
            <span className="text-lg font-semibold">管理后台</span>
          </Link>
          
          <nav className="flex items-center gap-1">
            <Link
              href="/admin"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              文章管理
            </Link>
            <Link
              href="/admin/categories"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              分类管理
            </Link>
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              查看博客
            </Link>
          </nav>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout}>
          退出登录
        </Button>
      </div>
    </header>
  )
}
