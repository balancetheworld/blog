"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, User, LogOut } from "lucide-react"
import { useEffect, useState } from "react"

export function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // 检查是否已登录
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          const res = await fetch('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          if (res.ok) {
            setIsLoggedIn(true)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setIsLoggedIn(false)
    window.location.href = '/'
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">我的博客</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/blog/archive">
              <Button variant="ghost" size="sm">
                归档
              </Button>
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    管理后台
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退出
                </Button>
              </>
            ) : (
              <Link href="/blog/login">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  登录
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
