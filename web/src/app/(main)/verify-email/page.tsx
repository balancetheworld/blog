"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useI18n()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")

      if (!token) {
        setStatus("error")
        setMessage(locale === "zh" ? "缺少验证令牌" : "Missing verification token")
        return
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || (locale === "zh" ? "验证失败" : "Verification failed"))
        }

        setStatus("success")
        setMessage(locale === "zh" ? "邮箱验证成功！现在可以登录了。" : "Email verified successfully! You can now log in.")
      } catch (err) {
        setStatus("error")
        setMessage((err as Error).message)
      }
    }

    verifyEmail()
  }, [searchParams, locale])

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="glass-card p-8 text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h1 className="mb-2 text-xl font-semibold text-foreground">
                {locale === "zh" ? "正在验证..." : "Verifying..."}
              </h1>
              <p className="text-sm text-muted-foreground">
                {locale === "zh" ? "请稍候，正在验证您的邮箱" : "Please wait while we verify your email"}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="mb-2 text-xl font-semibold text-foreground">
                {locale === "zh" ? "验证成功！" : "Verified!"}
              </h1>
              <p className="mb-6 text-sm text-muted-foreground">{message}</p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {locale === "zh" ? "前往登录" : "Go to Login"}
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="mb-2 text-xl font-semibold text-foreground">
                {locale === "zh" ? "验证失败" : "Verification Failed"}
              </h1>
              <p className="mb-6 text-sm text-muted-foreground">{message}</p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {locale === "zh" ? "返回注册" : "Back to Register"}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {locale === "zh" ? "前往登录" : "Go to Login"}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
