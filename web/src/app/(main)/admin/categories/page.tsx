// "use client"：声明该文件为 Next.js 客户端组件（仅在浏览器端渲染），因为使用了 useState/useSWR 等客户端 Hooks
"use client"

// 导入 React 核心 Hooks：用于管理组件内部状态
import { useState } from "react"
// 导入 Next.js 路由 Hooks：用于页面跳转/导航
import { useRouter } from "next/navigation"
// 导入 useSWR：用于数据请求+缓存管理（自动处理加载/缓存/重新验证）
import useSWR from "swr"
// 导入 Lucide 图标库：用于页面操作按钮的图标展示
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical, Save, X, Lock } from "lucide-react"
// 导入 Next.js 链接组件：用于页面跳转（客户端导航，无刷新）
import Link from "next/link"
// 导入自定义 Auth 上下文：用于权限校验（判断是否登录/是否为管理员）
import { useAuth } from "@/lib/auth-context"
// 导入自定义国际化上下文：用于多语言切换（中文/英文）
import { useI18n } from "@/lib/i18n-context"
// 导入通用请求工具：useSWR 的请求器（封装了 fetch/axios）
import { fetcher } from "@/lib/fetcher"
// 导入封装的 API 服务：用于分类的增删改查请求
import api from "@/services/api"
// 导入分类类型（复用 types/index.ts 中的 Category 类型）
import type { Category } from "@/types"

// 分类表单组件：复用用于「新增分类」和「编辑分类」
// 参数说明：
// - initial: 可选，编辑时传入已有分类数据，新增时不传
// - onSave: 保存回调函数，接收表单数据并执行新增/编辑逻辑
// - onCancel: 取消回调函数，关闭表单/退出编辑状态
function CategoryForm({
  initial,
  onSave,
  onCancel,
  locale,
}: {
  initial?: Category
  onSave: (data: { slug: string; name_en: string; name_zh: string; sort_order: number; is_private: number }) => Promise<void>
  onCancel: () => void
  locale: 'zh' | 'en'
}) {
  // 初始化表单状态：新增时为空，编辑时用 initial 数据兜底
  const [slug, setSlug] = useState(initial?.slug || "")          // Slug 输入框状态
  const [nameEn, setNameEn] = useState(initial?.name_en || "")    // 英文名称输入框状态
  const [nameZh, setNameZh] = useState(initial?.name_zh || "")    // 中文名称输入框状态
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0) // 排序权重状态（默认0）
  const [isPrivate, setIsPrivate] = useState(initial?.is_private ?? 0) // 私密状态（默认0即公开）
  const [saving, setSaving] = useState(false)                    // 保存按钮加载状态（防止重复提交）

  // 表单提交处理函数：验证并提交表单数据
  const handleSubmit = async () => {
    // 表单验证：Slug/英文名称/中文名称不能为空（去空格后）
    if (!slug.trim() || !nameEn.trim() || !nameZh.trim()) return
    // 设置保存中状态，禁用按钮
    setSaving(true)
    try {
      // 调用父组件传入的保存回调，传递处理后的表单数据（去空格）
      await onSave({
        slug: slug.trim(),
        name_en: nameEn.trim(),
        name_zh: nameZh.trim(),
        sort_order: sortOrder,
        is_private: isPrivate
      })
    } finally {
      // 无论成功失败，都取消保存中状态
      setSaving(false)
    }
  }

  return (
    <div className="glass-card p-5"> {/* 毛玻璃样式的表单容器 */}
      {/* 表单网格布局：移动端1列，小屏及以上2列，间距3，底部外边距3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Slug 输入框 */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Slug</label>
          <input
            value={slug}                     // 绑定状态值
            onChange={(e) => setSlug(e.target.value)} // 输入变化更新状态
            placeholder="e.g. tech"          // 示例提示
            disabled={!!initial}             // 编辑时禁用（Slug 不允许修改）
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
        </div>
        {/* 排序权重输入框 */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Sort Order</label>
          <input
            type="number"                    // 限定为数字输入
            value={sortOrder}                // 绑定状态值
            onChange={(e) => setSortOrder(Number(e.target.value))} // 转换为数字并更新状态
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {/* 英文名称输入框 */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">English Name</label>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Technology"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {/* 中文名称输入框 */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Chinese Name</label>
          <input
            value={nameZh}
            onChange={(e) => setNameZh(e.target.value)}
            placeholder="技术"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {/* 私密开关 */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_private"
            checked={isPrivate === 1}
            onChange={(e) => setIsPrivate(e.target.checked ? 1 : 0)}
            className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary/30"
          />
          <label htmlFor="is_private" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
            <Lock className="h-3 w-3" />
            {locale === "zh" ? "设为私密（仅自己可见）" : "Private (only visible to you)"}
          </label>
        </div>
      </div>
      {/* 表单操作按钮：取消 + 保存 */}
      <div className="flex items-center gap-2 justify-end">
        {/* 取消按钮 */}
        <button
          onClick={onCancel}                // 点击触发取消回调
          className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="h-3.5 w-3.5 inline mr-1" /> {/* 关闭图标 */}
          Cancel
        </button>
        {/* 保存按钮 */}
        <button
          onClick={handleSubmit}            // 点击触发提交
          // 禁用条件：保存中 或 表单必填项为空
          disabled={saving || !slug.trim() || !nameEn.trim() || !nameZh.trim()}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5 inline mr-1" /> {/* 保存图标 */}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  )
}

// 分类管理页面主组件
export default function CategoriesPage() {
  // 初始化路由 Hooks：用于页面跳转
  const router = useRouter()
  // 获取权限状态：判断是否登录、是否为管理员、权限加载状态
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()
  // 获取国际化状态：当前语言（zh/en）
  const { locale } = useI18n()
  // 控制新增分类表单的显示/隐藏
  const [showNew, setShowNew] = useState(false)
  // 控制编辑状态：存储当前正在编辑的分类ID，null 表示无编辑
  const [editingId, setEditingId] = useState<number | null>(null)

  // 使用 useSWR 请求分类列表数据：
  // - 第一个参数：请求URL
  // - 第二个参数：请求器（fetcher）
  // - 返回值：data（响应数据）、mutate（手动刷新数据）
  const { data, mutate } = useSWR("/api/admin/categories", fetcher)
  // 格式化分类数据：兜底为空数组，避免 undefined 报错
  const categories: Category[] = data?.data || []

  // 权限校验：如果权限加载完成，且未登录/非管理员，跳转到对应页面
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    // 已登录但非管理员 → 跳转到首页；未登录 → 跳转到登录页
    router.replace(isAuthenticated ? "/" : "/login")
    return null // 停止渲染
  }

  // 新增分类处理函数：调用 API 创建分类
  const handleCreate = async (formData: { slug: string; name_en: string; name_zh: string; sort_order: number; is_private: number }) => {
    try {
      // 调用 POST 请求创建分类
      const result = await api.post<any>('/api/admin/categories', formData)
      if (result.success) {
        // 创建成功：关闭新增表单，刷新分类列表
        setShowNew(false)
        mutate() // 手动触发 useSWR 重新请求数据
      } else {
        // 创建失败：提示错误
        alert(result.error || "Failed to create")
      }
    } catch (error: any) {
      // 捕获网络/接口异常：提示错误
      alert(error?.error || "Failed to create")
    }
  }

  // 编辑分类处理函数：调用 API 更新指定ID的分类
  const handleUpdate = async (id: number, formData: { slug: string; name_en: string; name_zh: string; sort_order: number; is_private: number }) => {
    try {
      // 调用 PUT 请求更新分类（路径带分类ID）
      const result = await api.put<any>(`/api/admin/categories/${id}`, formData)
      if (result.success) {
        // 更新成功：退出编辑状态，刷新分类列表
        setEditingId(null)
        mutate()
      } else {
        // 更新失败：提示错误
        alert(result.error || "Failed to update")
      }
    } catch (error: any) {
      // 捕获异常：提示错误
      alert(error?.error || "Failed to update")
    }
  }

  // 删除分类处理函数：调用 API 删除指定ID的分类
  const handleDelete = async (id: number) => {
    // 二次确认：防止误删，根据当前语言显示确认提示
    if (!confirm(locale === "zh" ? "确定删除这个分类吗？" : "Delete this category?")) return
    try {
      // 调用 DELETE 请求删除分类（路径带分类ID）
      const result = await api.delete<any>(`/api/admin/categories/${id}`)
      if (result.success) {
        // 删除成功：刷新分类列表
        mutate()
      } else {
        // 删除失败：提示错误
        alert(result.error || "Failed to delete")
      }
    } catch (error: any) {
      // 捕获异常：提示错误
      alert(error?.error || "Failed to delete")
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pt-24 pb-32"> {/* 页面主容器：居中、限定宽度、内边距 */}
      {/* 页面头部：返回按钮 + 标题 + 新增按钮 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {/* 返回按钮：跳转到管理员首页 */}
          <Link
            href="/admin"
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {/* 返回箭头图标 */}
          </Link>
          {/* 页面标题：根据当前语言显示中文/英文 */}
          <h1 className="text-xl font-bold text-foreground">
            {locale === "zh" ? "\u5206\u7c7b\u7ba1\u7406" : "Category Management"}
          </h1>
        </div>
        {/* 新增分类按钮：点击显示新增表单，退出编辑状态 */}
        <button
          onClick={() => { setShowNew(true); setEditingId(null) }}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> {/* 加号图标 */}
          {locale === "zh" ? "\u65b0\u589e" : "Add"}
        </button>
      </div>

      {/* 新增分类表单：showNew 为 true 时显示 */}
      {showNew && (
        <div className="mb-6">
          <CategoryForm
            onSave={handleCreate}          // 绑定新增回调
            onCancel={() => setShowNew(false)} // 取消时隐藏表单
            locale={locale}
          />
        </div>
      )}

      {/* 分类列表容器 */}
      <div className="flex flex-col gap-3">
        {/* 遍历分类列表：根据编辑状态渲染不同内容 */}
        {categories.map((cat) =>
          // 如果当前分类ID等于编辑ID → 渲染编辑表单；否则渲染分类卡片
          editingId === cat.id ? (
            <CategoryForm
              key={cat.id}                 // 唯一key，避免React渲染警告
              initial={cat}                // 传入当前分类数据（编辑用）
              onSave={(d) => handleUpdate(cat.id, d)} // 绑定编辑回调
              onCancel={() => setEditingId(null)}    // 取消时退出编辑
              locale={locale}
            />
          ) : (
            <div
              key={cat.id}
              className="glass-card flex items-center justify-between p-4" // 分类卡片样式
            >
              {/* 分类信息左侧：拖拽图标 + 名称/Slug/排序 */}
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/40" /> {/* 拖拽排序图标（视觉占位，暂无功能） */}
                <div>
                  <div className="flex items-center gap-2">
                    {/* 分类名称：根据当前语言显示中文/英文 */}
                    <span className="text-sm font-medium text-foreground">
                      {locale === "zh" ? cat.name_zh : cat.name_en}
                    </span>
                    {/* 私密标识 */}
                    {cat.is_private === 1 && (
                      <span className="flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                        <Lock className="h-2.5 w-2.5" />
                        {locale === "zh" ? "私密" : "Private"}
                      </span>
                    )}
                    {/* Slug 标签：展示URL友好标识 */}
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                      {cat.slug}
                    </span>
                  </div>
                  {/* 分类辅助信息：显示另一语言名称 + 排序权重 */}
                  <span className="text-xs text-muted-foreground">
                    {locale === "zh" ? cat.name_en : cat.name_zh}
                    {" \u00B7 "} {/* · 分隔符的Unicode编码 */}
                    {locale === "zh" ? "\u6392\u5e8f" : "Order"}: {cat.sort_order}
                  </span>
                </div>
              </div>
              {/* 分类操作右侧：编辑 + 删除按钮 */}
              <div className="flex items-center gap-1">
                {/* 编辑按钮：点击进入该分类的编辑状态，隐藏新增表单 */}
                <button
                  onClick={() => { setEditingId(cat.id); setShowNew(false) }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" /> {/* 铅笔编辑图标 */}
                </button>
                {/* 删除按钮：点击触发删除确认 */}
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> {/* 垃圾桶删除图标 */}
                </button>
              </div>
            </div>
          )
        )}

        {/* 空状态：分类列表为空时显示 */}
        {categories.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {locale === "zh" ? "\u8fd8\u6ca1\u6709\u5206\u7c7b\uff0c\u70b9\u51fb\u4e0a\u65b9\u201c\u65b0\u589e\u201d\u6309\u94ae\u521b\u5efa" : "No categories yet. Click \"Add\" to create one."}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}