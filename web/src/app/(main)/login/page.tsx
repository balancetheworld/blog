"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Mail, User, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading, refresh } = useAuth()
  const { locale } = useI18n()
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/")
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    )
  }

  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const useEmail = isEmail(account)
      const endpoint = useEmail ? "/api/auth/login-email" : "/api/auth/login"
      const body = useEmail
        ? { email: account, password }
        : { username: account, password }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || (locale === "zh" ? "登录失败" : "Login failed"))
      }
      // 刷新认证状态（使用 SWR 的 mutate）
      await refresh()
      setLoading(false)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {locale === "zh" ? "欢迎回来" : "Welcome Back"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {locale === "zh" ? "登录您的账户" : "Sign in to your account"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="account" className="text-xs font-medium text-muted-foreground">
                {locale === "zh" ? "用户名或邮箱" : "Username or Email"}
              </label>
              <div className="relative">
                {isEmail(account)
                  ? <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  : <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                }
                <input
                  id="account"
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder={locale === "zh" ? "用户名或邮箱" : "username or email"}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                {locale === "zh" ? "密码" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder="********"
                  required
                  autoComplete="current-password"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {locale === "zh" ? "登录" : "Sign In"}
            </button>
          </form>

          {/* Forgot password link */}
          <div className="mt-4 text-center">
            <Link href="/reset-password" className="text-sm text-muted-foreground hover:text-primary">
              {locale === "zh" ? "忘记密码？" : "Forgot password?"}
            </Link>
          </div>

          {/* Register link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {locale === "zh" ? "还没有账户？" : "Don't have an account?"}
            </span>{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {locale === "zh" ? "立即注册" : "Sign up"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
