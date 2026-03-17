"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"

export default function RegisterPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [code, setCode] = useState("")

  // 密码可见性状态
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 验证码状态
  const [codeSent, setCodeSent] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 发送验证码
  const handleSendCode = async () => {
    if (!email) {
      setError(locale === "zh" ? "请输入邮箱地址" : "Please enter email address")
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(locale === "zh" ? "请输入有效的邮箱地址" : "Please enter a valid email")
      return
    }

    setSendingCode(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || (locale === "zh" ? "发送失败" : "Failed to send"))
      }

      setCodeSent(true)
      setCodeVerified(false)
      setCountdown(60) // 60秒倒计时

      // 在开发环境显示验证码（如果没有配置邮件服务）
      if (process.env.NODE_ENV === "development") {
        console.log("\n=== 开发环境提示 ===")
        console.log("如果邮件服务未配置，请查看后端控制台获取验证码")
        console.log("===================\n")
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSendingCode(false)
    }
  }

  // 验证验证码
  const handleVerifyCode = async () => {
    if (!email || !code) {
      setError(locale === "zh" ? "请输入邮箱和验证码" : "Please enter email and code")
      return
    }

    if (code.length !== 6) {
      setError(locale === "zh" ? "请输入6位验证码" : "Please enter 6-digit code")
      return
    }

    setVerifyingCode(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || (locale === "zh" ? "验证失败" : "Verification failed"))
      }

      setCodeVerified(true)
      setError("")
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setVerifyingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证密码是否匹配
    if (password !== confirmPassword) {
      setError(locale === "zh" ? "两次输入的密码不一致" : "Passwords do not match")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || (locale === "zh" ? "注册失败" : "Registration failed"))
      }

      setSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="glass-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              {locale === "zh" ? "注册成功！" : "Registration Successful!"}
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              {locale === "zh"
                ? "您的账户已创建完成，现在可以登录了。"
                : "Your account has been created successfully. You can now log in."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                {locale === "zh" ? "前往登录" : "Go to Login"}
              </Link>
            </div>
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
              <User className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {locale === "zh" ? "邮箱注册" : "Email Registration"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {locale === "zh" ? "创建账户以开始使用" : "Create an account to get started"}
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
              <label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">
                {locale === "zh" ? "显示名称" : "Display Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder={locale === "zh" ? "你的名称" : "Your name"}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                {locale === "zh" ? "邮箱地址" : "Email Address"}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
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
                    disabled={codeVerified}
                  />
                </div>
                {!codeVerified && (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || countdown > 0 || !email}
                    className="rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 whitespace-nowrap"
                  >
                    {sendingCode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      locale === "zh" ? "获取验证码" : "Get Code"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 验证码输入 */}
            {!codeVerified && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="code" className="text-xs font-medium text-muted-foreground">
                  {locale === "zh" ? "邮箱验证码" : "Verification Code"}
                </label>
                <div className="flex gap-2">
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="flex-1 rounded-lg border border-border bg-background/50 py-2.5 px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                    placeholder={locale === "zh" ? "6位数字" : "6 digits"}
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifyingCode || code.length !== 6}
                    className="rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {verifyingCode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      locale === "zh" ? "验证" : "Verify"
                    )}
                  </button>
                </div>
                {codeVerified && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {locale === "zh" ? "已验证" : "Verified"}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                {locale === "zh" ? "密码" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder="********"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {locale === "zh" ? "密码至少需要 6 个字符" : "Password must be at least 6 characters"}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">
                {locale === "zh" ? "确认密码" : "Confirm Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder="********"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">
                  {locale === "zh" ? "两次输入的密码不一致" : "Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !codeVerified}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {locale === "zh" ? "注册" : "Sign Up"}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {locale === "zh" ? "已有账户？" : "Already have an account?"}
            </span>{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {locale === "zh" ? "立即登录" : "Sign In"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
