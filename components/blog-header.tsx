/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-01-27 21:05:44
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-01-27 21:06:25
 * @FilePath: /blog/my-next-app/components/blog-header.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function BlogHeader() {
  const pathname = usePathname()
  const { data } = useSWR('/api/auth/me', fetcher)
  const user = data?.user

  const navItems = [
    { href: '/', label: '首页' },
    { href: '/archive', label: '归档' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <span className="text-sm font-bold">B</span>
          </div>
          <span className="text-lg font-semibold">我的博客</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {item.label}
            </Link>
          ))}
          
          {user ? (
            <>
              <Link
                href="/admin"
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                  pathname.startsWith('/admin')
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                管理
              </Link>
              <span className="ml-2 text-sm text-muted-foreground">
                {user.name}
              </span>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="ml-2 bg-transparent">
                登录
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
