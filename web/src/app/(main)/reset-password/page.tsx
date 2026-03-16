"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useI18n()
  const token = searchParams.get("token")
  const [mode, setMode] = useState<"request" | "reset">("request")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      setMode("reset")
    }
  }, [token])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || (locale === "zh" ? "请求失败" : "Request failed"))
      }

      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError(locale === "zh" ? "两次输入的密码不一致" : "Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError(locale === "zh" ? "密码至少需要 6 个字符" : "Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || (locale === "zh" ? "重置失败" : "Reset failed"))
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // 请求重置密码成功
  if (mode === "request" && success) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="glass-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              {locale === "zh" ? "邮件已发送！" : "Email Sent!"}
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              {locale === "zh"
                ? "如果该邮箱已注册，我们已发送密码重置链接到您的邮箱。"
                : "If the email is registered, we've sent a password reset link to your inbox."}
            </p>
            <div className="rounded-lg bg-muted/50 p-4 text-left text-sm">
              <p className="font-medium text-foreground">{email}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {locale === "zh"
                  ? "重置链接将在 1 小时后过期。如果没有收到邮件，请检查垃圾邮件文件夹。"
                  : "The reset link will expire in 1 hour. If you don't receive the email, please check your spam folder."}
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                {locale === "zh" ? "返回登录" : "Back to Login"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 重置密码成功
  if (mode === "reset" && success) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="glass-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              {locale === "zh" ? "密码重置成功！" : "Password Reset Successful!"}
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              {locale === "zh" ? "正在跳转到登录页面..." : "Redirecting to login..."}
            </p>
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {mode === "request" ? <Mail className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-primary" />}
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {mode === "request"
                ? (locale === "zh" ? "忘记密码" : "Forgot Password")
                : (locale === "zh" ? "设置新密码" : "Set New Password")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "request"
                ? (locale === "zh" ? "输入您的邮箱地址以重置密码" : "Enter your email to reset your password")
                : (locale === "zh" ? "请输入您的新密码" : "Please enter your new password")}
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
          {mode === "request" ? (
            <form onSubmit={handleRequestReset} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  {locale === "zh" ? "邮箱地址" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {locale === "zh" ? "发送重置链接" : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                  {locale === "zh" ? "新密码" : "New Password"}
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
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">
                  {locale === "zh" ? "确认密码" : "Confirm Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                    placeholder="********"
                    required
                    autoComplete="new-password"
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
                {locale === "zh" ? "重置密码" : "Reset Password"}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="inline-flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              {locale === "zh" ? "返回登录" : "Back to Login"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
