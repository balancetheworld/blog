"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, User, Loader2, AlertCircle, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"

export default function LoginPage() {
  const router = useRouter()
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth()
  const { t, locale } = useI18n()
  const [tab, setTab] = useState<"login" | "register">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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

    if (tab === "login") {
      const result = await login(username, password)
      if (!result.success) {
        setError(result.error || (locale === "zh" ? "\u767b\u5f55\u5931\u8d25" : "Login failed"))
        setLoading(false)
      }
      // Success: useEffect will handle redirect when isAuthenticated becomes true
    } else {
      const result = await register(username, password, displayName || username)
      if (!result.success) {
        setError(result.error || (locale === "zh" ? "\u6ce8\u518c\u5931\u8d25" : "Registration failed"))
        setLoading(false)
      }
      // Success: useEffect will handle redirect when isAuthenticated becomes true
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {tab === "login" ? (
                <Lock className="h-5 w-5 text-primary" />
              ) : (
                <UserPlus className="h-5 w-5 text-primary" />
              )}
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {tab === "login"
                ? (locale === "zh" ? "\u767b\u5f55" : "Sign In")
                : (locale === "zh" ? "\u6ce8\u518c" : "Create Account")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === "login"
                ? (locale === "zh" ? "\u767b\u5f55\u4ee5\u53c2\u4e0e\u8bc4\u8bba\u548c\u70b9\u8d5e" : "Sign in to comment and like")
                : (locale === "zh" ? "\u521b\u5efa\u8d26\u6237\u5f00\u59cb\u4e92\u52a8" : "Create an account to interact")}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="mb-6 flex items-center rounded-lg bg-muted/50 p-1">
            <button
              onClick={() => { setTab("login"); setError("") }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "zh" ? "\u767b\u5f55" : "Sign In"}
            </button>
            <button
              onClick={() => { setTab("register"); setError("") }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === "register"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "zh" ? "\u6ce8\u518c" : "Sign Up"}
            </button>
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
            {tab === "register" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">
                  {locale === "zh" ? "\u663e\u793a\u540d\u79f0" : "Display Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                    placeholder={locale === "zh" ? "\u4f60\u7684\u540d\u79f0" : "Your name"}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-xs font-medium text-muted-foreground">
                {locale === "zh" ? "\u7528\u6237\u540d" : "Username"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder={locale === "zh" ? "\u7528\u6237\u540d" : "Username"}
                  required
                  autoComplete="username"
                  minLength={3}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                {locale === "zh" ? "\u5bc6\u7801" : "Password"}
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
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
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
              {tab === "login"
                ? (locale === "zh" ? "\u767b\u5f55" : "Sign In")
                : (locale === "zh" ? "\u6ce8\u518c" : "Create Account")}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
