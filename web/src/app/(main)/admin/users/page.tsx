"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Users,
  Loader2,
  ArrowLeft,
  Search,
  Plus,
  MoreVertical,
  Shield,
  ShieldCheck,
  Mail,
  MailCheck,
  Trash2,
  Key,
  RefreshCw,
  User as UserIcon,
  Edit,
  X,
  CheckCircle2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"

interface User {
  id: number
  username: string
  email: string | null
  displayName: string
  role: string
  emailVerified: boolean
  createdAt: string
}

type UserRole = "admin" | "user"

export default function UsersManagePage() {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()
  const { locale } = useI18n()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // 编辑模式
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ displayName: "", role: "user" as UserRole })

  // 创建用户模式
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ email: "", password: "", displayName: "", role: "user" as UserRole })
  const [creating, setCreating] = useState(false)

  // 删除确认
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // 消息提示
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.replace("/admin")
    }
  }, [authLoading, isAuthenticated, isAdmin, router])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsers(data.data)
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers()
    }
  }, [isAuthenticated, isAdmin])

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // 过滤用户
  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 开始编辑用户
  const startEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({ displayName: user.displayName, role: user.role as UserRole })
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingUser(null)
    setEditForm({ displayName: "", role: "user" })
  }

  // 保存编辑
  const saveEdit = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editForm.displayName,
          role: editForm.role,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Update failed")
      }

      showMessage("success", locale === "zh" ? "用户已更新" : "User updated")
      fetchUsers()
      cancelEdit()
    } catch (error) {
      showMessage("error", (error as Error).message)
    }
  }

  // 创建用户
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setCreating(true)
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Creation failed")
      }

      showMessage("success", locale === "zh" ? "用户已创建" : "User created")
      setShowCreateModal(false)
      setCreateForm({ email: "", password: "", displayName: "", role: "user" })
      fetchUsers()
    } catch (error) {
      showMessage("error", (error as Error).message)
    } finally {
      setCreating(false)
    }
  }

  // 删除用户
  const deleteUser = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Delete failed")
      }

      showMessage("success", locale === "zh" ? "用户已删除" : "User deleted")
      fetchUsers()
      setDeleteConfirm(null)
    } catch (error) {
      showMessage("error", (error as Error).message)
    }
  }

  // 重置用户密码
  const resetPassword = async (id: number) => {
    const newPassword = prompt(locale === "zh" ? "请输入新密码（至少6个字符）" : "Enter new password (min 6 characters)")
    if (!newPassword || newPassword.length < 6) {
      showMessage("error", locale === "zh" ? "密码至少需要 6 个字符" : "Password must be at least 6 characters")
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Reset failed")
      }

      showMessage("success", locale === "zh" ? "密码已重置" : "Password reset")
    } catch (error) {
      showMessage("error", (error as Error).message)
    }
  }

  // 重新发送验证邮件
  const resendVerification = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/users/${id}/resend-verification`, {
        method: "POST",
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed")
      }

      showMessage("success", locale === "zh" ? "验证邮件已发送" : "Verification email sent")
    } catch (error) {
      showMessage("error", (error as Error).message)
    }
  }

  // 切换邮箱验证状态
  const toggleEmailVerified = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailVerified: !currentStatus }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Update failed")
      }

      showMessage("success", locale === "zh" ? "验证状态已更新" : "Verification status updated")
      fetchUsers()
    } catch (error) {
      showMessage("error", (error as Error).message)
    }
  }

  if (authLoading || loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {locale === "zh" ? "用户管理" : "User Management"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh" ? "管理系统用户和权限" : "Manage system users and permissions"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {locale === "zh" ? "添加用户" : "Add User"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 ${
              message.type === "success"
                ? "bg-green-500/10 text-green-500"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Search */}
        <div className="glass-card mb-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "zh" ? "搜索用户名、邮箱或显示名称..." : "Search by username, email or display name..."}
              className="w-full rounded-lg border border-border bg-background/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    {locale === "zh" ? "用户" : "User"}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    {locale === "zh" ? "邮箱" : "Email"}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    {locale === "zh" ? "角色" : "Role"}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    {locale === "zh" ? "状态" : "Status"}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    {locale === "zh" ? "操作" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      {searchQuery
                        ? (locale === "zh" ? "没有找到匹配的用户" : "No users found")
                        : (locale === "zh" ? "暂无用户" : "No users yet")}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        {editingUser?.id === u.id ? (
                          <input
                            type="text"
                            value={editForm.displayName}
                            onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                            className="w-full max-w-[150px] rounded border border-border bg-background px-2 py-1 text-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{u.displayName}</p>
                              <p className="text-xs text-muted-foreground">@{u.username}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {u.email || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingUser?.id === u.id ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                            className="rounded border border-border bg-background px-2 py-1 text-sm"
                          >
                            <option value="user">{locale === "zh" ? "普通用户" : "User"}</option>
                            <option value="admin">{locale === "zh" ? "管理员" : "Admin"}</option>
                          </select>
                        ) : (
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              u.role === "admin"
                                ? "bg-purple-500/10 text-purple-500"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {u.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                            {u.role === "admin" ? (locale === "zh" ? "管理员" : "Admin") : (locale === "zh" ? "用户" : "User")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleEmailVerified(u.id, u.emailVerified)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            u.emailVerified
                              ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                              : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                          }`}
                          title={locale === "zh" ? "点击切换状态" : "Click to toggle"}
                        >
                          {u.emailVerified ? <MailCheck className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                          {u.emailVerified
                            ? (locale === "zh" ? "已验证" : "Verified")
                            : (locale === "zh" ? "未验证" : "Not Verified")}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {editingUser?.id === u.id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-green-500 hover:bg-green-500/10"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(u)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                                title={locale === "zh" ? "编辑" : "Edit"}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {!u.emailVerified && u.email && (
                                <button
                                  onClick={() => resendVerification(u.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                                  title={locale === "zh" ? "重发验证邮件" : "Resend verification"}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => resetPassword(u.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                                title={locale === "zh" ? "重置密码" : "Reset password"}
                              >
                                <Key className="h-4 w-4" />
                              </button>
                              {u.id !== user?.id && (
                                <>
                                  {deleteConfirm === u.id ? (
                                    <>
                                      <button
                                        onClick={() => deleteUser(u.id)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteConfirm(u.id)}
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                                      title={locale === "zh" ? "删除" : "Delete"}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>
            {locale === "zh" ? "总计" : "Total"}: {users.length} {locale === "zh" ? "位用户" : "users"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-purple-500" />
            {users.filter((u) => u.role === "admin").length} {locale === "zh" ? "位管理员" : "admins"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MailCheck className="h-4 w-4 text-green-500" />
            {users.filter((u) => u.emailVerified).length} {locale === "zh" ? "位已验证" : "verified"}
          </span>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-card w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {locale === "zh" ? "添加新用户" : "Add New User"}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createUser} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {locale === "zh" ? "显示名称" : "Display Name"}
                </label>
                <input
                  type="text"
                  value={createForm.displayName}
                  onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {locale === "zh" ? "邮箱地址" : "Email Address"}
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {locale === "zh" ? "密码" : "Password"}
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {locale === "zh" ? "角色" : "Role"}
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                >
                  <option value="user">{locale === "zh" ? "普通用户" : "User"}</option>
                  <option value="admin">{locale === "zh" ? "管理员" : "Admin"}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {locale === "zh" ? "取消" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : locale === "zh" ? "创建" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
