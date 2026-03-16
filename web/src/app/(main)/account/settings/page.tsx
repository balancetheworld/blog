"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  X,
  RefreshCw,
  Settings,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"

export default function AccountSettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, refresh } = useAuth()
  const { locale } = useI18n()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // 邮箱更换状态
  const [showEmailChange, setShowEmailChange] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [changingEmail, setChangingEmail] = useState(false)

  // 获取用户详细信息（包含邮箱字段）
  const [userDetails, setUserDetails] = useState<{
    email?: string
    emailVerified?: boolean
    newEmail?: string | null
  } | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    // 获取用户详细信息
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUserDetails({
              email: data.data.email,
              emailVerified: data.data.emailVerified,
              newEmail: data.data.newEmail,
            })
          }
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err)
      }
    }

    if (isAuthenticated) {
      fetchUserDetails()
    }
  }, [isAuthenticated])

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // 重新发送验证邮件
  const handleResendVerification = async () => {
    if (!userDetails?.email) return

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userDetails.email }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || (locale === "zh" ? "发送失败" : "Failed to send"))
      }

      showMessage("success", locale === "zh" ? "验证邮件已发送" : "Verification email sent")
    } catch (err) {
      showMessage("error", (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // 请求更换邮箱
  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      showMessage("error", locale === "zh" ? "请输入有效的邮箱地址" : "Please enter a valid email")
      return
    }

    setChangingEmail(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/request-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || (locale === "zh" ? "请求失败" : "Request failed"))
      }

      showMessage("success", locale === "zh" ? "验证邮件已发送到新邮箱" : "Verification email sent to new email")
      setShowEmailChange(false)
      setNewEmail("")

      // 刷新用户信息
      setTimeout(() => {
        fetch("/api/auth/me")
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setUserDetails({
                email: data.data.email,
                emailVerified: data.data.emailVerified,
                newEmail: data.data.newEmail,
              })
            }
          })
      }, 500)
    } catch (err) {
      showMessage("error", (err as Error).message)
    } finally {
      setChangingEmail(false)
    }
  }

  // 取消邮箱更换
  const handleCancelEmailChange = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/cancel-email-change", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || (locale === "zh" ? "取消失败" : "Failed to cancel"))
      }

      showMessage("success", locale === "zh" ? "已取消邮箱更换请求" : "Email change cancelled")

      // 刷新用户信息
      setUserDetails((prev) => ({ ...prev!, newEmail: null }))
    } catch (err) {
      showMessage("error", (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {locale === "zh" ? "账户设置" : "Account Settings"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {locale === "zh" ? "管理您的账户信息和安全设置" : "Manage your account info and security settings"}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-lg px-4 py-3 ${
              message.type === "success"
                ? "bg-green-500/10 text-green-500"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Email Section */}
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-medium text-foreground">
              {locale === "zh" ? "邮箱地址" : "Email Address"}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Current Email */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {locale === "zh" ? "当前邮箱" : "Current Email"}
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {userDetails?.email || (locale === "zh" ? "未设置" : "Not set")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {userDetails?.emailVerified ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">
                        {locale === "zh" ? "已验证" : "Verified"}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-amber-500">
                        {locale === "zh" ? "未验证" : "Not Verified"}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 未验证时显示重发验证邮件按钮 */}
              {userDetails?.email && !userDetails.emailVerified && (
                <div className="mt-3 flex items-center justify-between rounded-md bg-amber-500/10 px-3 py-2">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {locale === "zh"
                      ? "邮箱未验证，某些功能可能受限"
                      : "Email not verified, some features may be limited"}
                  </p>
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    {locale === "zh" ? "重发验证邮件" : "Resend"}
                  </button>
                </div>
              )}
            </div>

            {/* 待验证的新邮箱 */}
            {userDetails?.newEmail && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {locale === "zh" ? "待验证的新邮箱" : "Pending Email Change"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{userDetails.newEmail}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelEmailChange}
                    disabled={loading}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        {locale === "zh" ? "取消" : "Cancel"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 更换邮箱按钮/表单 */}
            {!showEmailChange ? (
              <button
                onClick={() => setShowEmailChange(true)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {locale === "zh" ? "更换邮箱" : "Change Email"}
              </button>
            ) : (
              <form onSubmit={handleRequestEmailChange} className="space-y-3">
                <div>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={locale === "zh" ? "新邮箱地址" : "New email address"}
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={changingEmail || !newEmail}
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {changingEmail ? (
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                    ) : (
                      locale === "zh" ? "发送验证邮件" : "Send Verification"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailChange(false)
                      setNewEmail("")
                    }}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {locale === "zh" ? "取消" : "Cancel"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
