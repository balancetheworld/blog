"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, ArrowUp, MessageCircle, ChevronRight, Menu, Settings, LogIn, LogOut, Tags } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n-context"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSwitcher } from "./language-switcher"

const NAV_ITEMS = [
  { id: "home", href: "/", icon: Home, labelKey: "nav.home" },
  { id: "recently", href: "/recently", icon: MessageCircle, labelKey: "nav.recently" },
  { id: "about", href: "/about", icon: User, labelKey: "nav.about" },
]

export function FloatingNav() {
  const pathname = usePathname()
  const { t } = useI18n()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const isHomePage = pathname === "/"

  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = docHeight > 0 ? Math.min((scrollY / docHeight) * 100, 100) : 0
    setReadingProgress(progress)
    setShowBackToTop(scrollY > 300)
    if (window.innerWidth >= 768) {
      if (isHomePage) {
        setIsExpanded(scrollY <= 100 || isHovering)
      } else {
        setIsExpanded(isHovering)
      }
    }
  }, [isHomePage, isHovering])

  useEffect(() => {
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  useEffect(() => { setMobileMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [mobileMenuOpen])

  // Close user dropdown on outside click
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

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const circleRadius = 16
  const circumference = 2 * Math.PI * circleRadius
  const progressOffset = circumference - (readingProgress / 100) * circumference

  const handleLogout = async () => {
    setShowUserMenu(false)
    await logout()
  }

  return (
    <>
      {/* Top reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* ===== MOBILE: Bottom center capsule + drawer ===== */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden" ref={navRef}>
        {mobileMenuOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 animate-fade-in">
            <div className="glass-nav rounded-2xl px-3 py-3">
              <nav className="flex flex-col gap-0.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {t(item.labelKey)}
                    </Link>
                  )
                })}
              </nav>

              {/* Admin links */}
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
                    {t("admin.articles")}
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
                    {t("admin.categories")}
                  </Link>
                </div>
              )}

              {/* Auth section in mobile drawer */}
              <div className="mt-2 border-t border-border pt-2">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span>{user?.displayName}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 text-left"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      {t("admin.logout")}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <LogIn className="h-4 w-4 shrink-0" />
                    {t("admin.signIn")}
                  </Link>
                )}
              </div>

              <div className="mt-2 flex items-center justify-center gap-1 border-t border-border pt-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}

        {/* Mobile capsule */}
        <div className="glass-nav flex items-center gap-1 rounded-full px-2 py-1.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-foreground"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
            <span className="text-xs">{t("site.title")}</span>
          </button>
          <div className="h-4 w-px bg-border" />
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

      {/* ===== DESKTOP: Left capsule at top-left ===== */}
      <nav
        className="fixed left-6 top-6 z-50 hidden md:block"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="glass-nav flex items-center rounded-full px-3 py-2 transition-all duration-300">
          {/* Avatar / site identity */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              A
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {t("site.title")}
            </span>
          </Link>

          <div className="mx-2 h-4 w-px bg-border shrink-0" />

          {/* Expand hint arrow */}
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "w-0 opacity-0" : "w-5 opacity-100"}`}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Nav items (expanded) */}
          <div className={`flex items-center gap-0.5 overflow-hidden transition-all duration-300 ${isExpanded ? "max-w-[800px] opacity-100" : "max-w-0 opacity-0"}`}>
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

            {/* Admin links */}
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

            {/* Divider before user area */}
            <div className="mx-1 h-4 w-px bg-border shrink-0" />

            {/* User / Login button */}
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
                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-44 animate-fade-in glass-nav rounded-xl px-2 py-2">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                      @{user?.username}
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        {t("admin.dashboard")}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
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
        </div>
      </nav>

      {/* ===== Back to top with reading progress ring ===== */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          showBackToTop ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={scrollToTop}
          className="group relative flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          aria-label={t("nav.backToTop")}
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r={circleRadius} fill="none" className="stroke-border" strokeWidth="2" />
            <circle
              cx="20" cy="20" r={circleRadius} fill="none"
              className="stroke-primary transition-all duration-150 ease-out"
              strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={progressOffset}
            />
          </svg>
          <div className="absolute inset-[3px] rounded-full glass-nav" />
          <ArrowUp className="relative z-10 h-4 w-4" />
        </button>
      </div>
    </>
  )
}
