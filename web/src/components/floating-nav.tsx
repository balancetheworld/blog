// "use client"：声明该文件为 Next.js 客户端组件（仅在浏览器端渲染）
// 因为使用了 useState/useEffect/useRef 等客户端专属 Hooks，无法在服务端组件中运行
"use client"

// 导入 Next.js 核心组件/API：
import Link from "next/link"               // 客户端路由链接（无刷新跳转）
import { usePathname } from "next/navigation" // 获取当前页面路径（如 /admin/categories）

// 导入 Lucide 图标库：导航菜单使用的矢量图标
import { Home, User, ArrowUp, MessageCircle, ChevronRight, Menu, Settings, LogIn, LogOut, Tags } from "lucide-react"

// 导入 React 核心 Hooks：
import { useCallback, useEffect, useRef, useState } from "react"
// useCallback：缓存函数，避免因组件重渲染重复创建函数（优化性能）
// useEffect：处理副作用（如监听滚动、点击事件）
// useRef：获取 DOM 元素引用（用于点击外部关闭菜单）
// useState：管理组件内部状态（如菜单展开/收起、滚动进度）

// 导入自定义上下文 Hooks：
import { useI18n } from "@/lib/i18n-context" // 国际化上下文（多语言切换）
import { useAuth } from "@/lib/auth-context" // 鉴权上下文（登录状态、管理员权限）

// 导入子组件：
import { ThemeToggle } from "./theme-toggle"       // 主题切换（亮色/暗色模式）
import { LanguageSwitcher } from "./language-switcher" // 语言切换（中/英文）

// 导航菜单基础配置：统一管理导航项的 ID、链接、图标、多语言文案 Key
// 好处：后续修改导航项只需改这里，无需修改渲染逻辑
const NAV_ITEMS = [
  { id: "home", href: "/", icon: Home, labelKey: "nav.home" },         // 首页
  { id: "recently", href: "/recently", icon: MessageCircle, labelKey: "nav.recently" }, // 最近更新
  { id: "about", href: "/about", icon: User, labelKey: "nav.about" },  // 关于页
]

// 悬浮导航主组件：适配移动端/桌面端，包含导航菜单、回到顶部、阅读进度等功能
export function FloatingNav() {
  // ========== 基础状态/数据获取 ==========
  const pathname = usePathname() // 获取当前页面路径（如 /admin/categories）
  const { t } = useI18n()       // 获取多语言翻译函数（t(key) → 对应语言文案）
  // 获取鉴权相关状态：是否登录、是否管理员、用户信息、登出方法
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const isHomePage = pathname === "/" // 判断是否为首页（用于控制导航展开逻辑）

  // ========== 核心状态管理 ==========
  const [isExpanded, setIsExpanded] = useState(false)          // 桌面端导航是否展开
  const [isHovering, setIsHovering] = useState(false)          // 桌面端导航是否被鼠标悬浮
  const [showBackToTop, setShowBackToTop] = useState(false)    // 是否显示「回到顶部」按钮
  const [readingProgress, setReadingProgress] = useState(0)    // 页面阅读进度（0-100%）
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)  // 移动端菜单是否展开
  const [showUserMenu, setShowUserMenu] = useState(false)      // 桌面端用户下拉菜单是否展开
  
  // ========== DOM 引用 ==========
  const navRef = useRef<HTMLDivElement>(null)        // 移动端导航容器引用（用于点击外部关闭菜单）
  const userMenuRef = useRef<HTMLDivElement>(null)   // 用户下拉菜单容器引用（用于点击外部关闭）

  // ========== 滚动事件处理（核心函数） ==========
  // useCallback 缓存函数，依赖项：isHomePage、isHovering
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY // 获取当前垂直滚动距离
    // 计算页面总可滚动高度（文档总高度 - 视口高度）
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    // 计算阅读进度（0-100%），Math.min 防止超过 100%
    const progress = docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0
    
    setReadingProgress(progress)          // 更新阅读进度
    setShowBackToTop(scrollY > 300)       // 滚动超过 300px 显示「回到顶部」按钮

    // 桌面端（≥768px）导航展开逻辑：
    if (window.innerWidth >= 768) {
      if (isHomePage) {
        // 首页：滚动 ≤100px 或鼠标悬浮时展开，否则收起
        setIsExpanded(scrollY <= 100 || isHovering)
      } else {
        // 非首页：仅鼠标悬浮时展开
        setIsExpanded(isHovering)
      }
    }
  }, [isHomePage, isHovering]) // 依赖项变化时重新创建函数

  // ========== 副作用处理 ==========
  // 1. 监听页面滚动事件：组件挂载时绑定，卸载时解绑
  useEffect(() => {
    handleScroll() // 初始化时执行一次（避免初始状态错误）
    // 绑定滚动事件，passive: true 优化滚动性能（不阻止默认行为）
    window.addEventListener("scroll", handleScroll, { passive: true })
    // 组件卸载时解绑事件（防止内存泄漏）
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll]) // 依赖 handleScroll 函数

  // 2. 页面跳转时关闭移动端菜单：路径变化时重置 mobileMenuOpen 为 false
  useEffect(() => { setMobileMenuOpen(false) }, [pathname])

  // 3. 点击移动端菜单外部关闭菜单：
  useEffect(() => {
    if (!mobileMenuOpen) return // 菜单未展开时不处理
    // 点击事件处理函数：判断点击目标是否在导航容器外
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false) // 关闭菜单
      }
    }
    document.addEventListener("mousedown", handleClick) // 绑定点击事件
    return () => document.removeEventListener("mousedown", handleClick) // 解绑
  }, [mobileMenuOpen]) // 依赖 mobileMenuOpen 状态

  // 4. 点击用户下拉菜单外部关闭菜单：逻辑同上
  useEffect(() => {
    if (!showUserMenu) return
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showUserMenu])

  // ========== 工具函数 ==========
  // 回到顶部函数：平滑滚动到页面顶部
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // 计算「回到顶部」按钮的环形进度参数：
  const circleRadius = 16 // 环形进度条半径
  const circumference = 2 * Math.PI * circleRadius // 环形周长（2πr）
  // 进度条偏移量：控制环形进度的显示（周长 - 已完成进度）
  const progressOffset = circumference - (readingProgress / 100) * circumference

  // 登出处理函数：先关闭用户菜单，再执行登出
  const handleLogout = async () => {
    setShowUserMenu(false)
    await logout()
  }

  // ========== UI 渲染 ==========
  return (
    <>
      {/* 1. 顶部阅读进度条：跟随页面滚动显示进度 */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }} // 动态设置宽度（0-100%）
        />
      </div>

      {/* 2. 移动端导航：底部居中胶囊 + 展开抽屉（仅 md 以下屏幕显示） */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden" ref={navRef}>
        {/* 移动端展开的抽屉菜单（mobileMenuOpen 为 true 时显示） */}
        {mobileMenuOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 animate-fade-in">
            <div className="glass-nav rounded-2xl px-3 py-3">
              {/* 基础导航项 */}
              <nav className="flex flex-col gap-0.5">
                {NAV_ITEMS.map((item) => {
                  // 判断当前导航项是否激活：路径完全匹配 或 非首页路径以导航项链接开头
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.id} // 唯一 key，避免 React 渲染警告
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium" // 激活状态样式
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50" // 普通/悬浮样式
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" /> {/* 导航图标 */}
                      {t(item.labelKey)} {/* 多语言文案 */}
                    </Link>
                  )
                })}
              </nav>

              {/* 管理员专属导航项（仅管理员可见） */}
              {isAdmin && (
                <div className="mt-2 border-t border-border pt-2 flex flex-col gap-0.5">
                  <Link
                    href="/admin"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === "/admin"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    {t("admin.articles")} {/* 文章管理 */}
                  </Link>
                  <Link
                    href="/admin/categories"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === "/admin/categories"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Tags className="h-4 w-4 shrink-0" />
                    {t("admin.categories")} {/* 分类管理 */}
                  </Link>
                </div>
              )}

              {/* 登录/用户信息区域 */}
              <div className="mt-2 border-t border-border pt-2">
                {isAuthenticated ? (
                  // 已登录：只显示登出按钮
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("admin.logout")}
                  </button>
                ) : (
                  // 未登录：显示登录按钮
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <LogIn className="h-4 w-4" />
                    {t("admin.signIn")}
                  </Link>
                )}
              </div>

              {/* 主题/语言切换 */}
              <div className="mt-2 flex items-center justify-center gap-1 border-t border-border pt-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}

        {/* 移动端底部胶囊按钮（默认显示） */}
        <div className="glass-nav flex items-center gap-1 rounded-full px-2 py-1.5">
          {/* 菜单展开/收起按钮 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} // 切换菜单状态
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-foreground"
            aria-label="Open navigation" // 无障碍标签
          >
            <Menu className="h-4 w-4" /> {/* 菜单图标 */}
            <span className="text-xs">{t("site.title")}</span> {/* 站点标题 */}
          </button>
          <div className="h-4 w-px bg-border" /> {/* 分隔线 */}
          {/* 显示前3个导航项的图标版 */}
          {NAV_ITEMS.slice(0, 3).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`rounded-full p-2 transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={t(item.labelKey)}
              >
                <item.icon className="h-3.5 w-3.5" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* 3. 桌面端导航：左上角胶囊式导航（仅 md 及以上屏幕显示） */}
      <nav
        className="fixed left-6 top-6 z-50 hidden md:block"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          // 用户菜单打开时，不收起导航栏
          if (!showUserMenu) {
            setIsHovering(false)
          }
        }}
      >
        <div className="glass-nav flex items-center rounded-full px-3 py-2 transition-all duration-300">
          {/* 站点标识/头像 */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
             <img src="/avatar.png" alt="Avatar" className="h-full w-full rounded-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {t("site.title")}
            </span>
          </Link>

          <div className="mx-2 h-4 w-px bg-border shrink-0" />

          {/* 展开提示箭头：展开时隐藏，收起时显示 */}
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "w-0 opacity-0" : "w-5 opacity-100"}`}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* 展开的导航项区域：根据 isExpanded 控制显示/隐藏 */}
          <div className={`flex items-center gap-0.5 overflow-hidden transition-all duration-300 ${isExpanded ? "max-w-[800px] opacity-100" : "max-w-0 opacity-0"}`}>
            {/* 基础导航项 */}
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {t(item.labelKey)}
                </Link>
              )
            })}

            <div className="mx-1 h-4 w-px bg-border shrink-0" />
            <ThemeToggle />
            <LanguageSwitcher />

            {/* 管理员专属导航项 */}
            {isAdmin && (
              <>
                <div className="mx-1 h-4 w-px bg-border shrink-0" />
                <Link
                  href="/admin"
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    pathname === "/admin"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  {t("admin.articles")}
                </Link>
                <Link
                  href="/admin/categories"
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    pathname === "/admin/categories"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Tags className="h-3.5 w-3.5" />
                  {t("admin.categories")}
                </Link>
              </>
            )}
          </div>

          <div className="mx-1 h-4 w-px bg-border shrink-0" />

          {/* 用户/登录区域：不受展开状态控制，始终显示 */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-xs transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="max-w-[60px] truncate whitespace-nowrap">{user?.displayName}</span>
              </button>
              {showUserMenu && (
                <div className="absolute left-3/5 -translate-x-1/2 top-full mt-3 w-20 animate-fade-in glass-nav rounded-lg px-1 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md px-1.5 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-3 w-3" />
                    {t("admin.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 whitespace-nowrap"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t("admin.signIn")}
            </Link>
          )}
        </div>
      </nav>

      {/* 4. 回到顶部按钮（带环形阅读进度） */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          showBackToTop ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={scrollToTop} // 点击回到顶部
          className="group relative flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          aria-label={t("nav.backToTop")} // 无障碍标签
        >
          {/* 环形进度条 SVG */}
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 40 40">
            {/* 背景环 */}
            <circle cx="20" cy="20" r={circleRadius} fill="none" className="stroke-border" strokeWidth="2" />
            {/* 进度环（动态偏移） */}
            <circle
              cx="20" cy="20" r={circleRadius} fill="none"
              className="stroke-primary transition-all duration-150 ease-out"
              strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={circumference} // 周长（总长度）
              strokeDashoffset={progressOffset} // 偏移量（控制显示长度）
            />
          </svg>
          <div className="absolute inset-[3px] rounded-full glass-nav" /> {/* 毛玻璃背景 */}
          <ArrowUp className="relative z-10 h-4 w-4" /> {/* 向上箭头 */}
        </button>
      </div>
    </>
  )
}