"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import { LanguageSwitcher } from "./language-switcher"

export function BlogHeader() {
  const { t } = useI18n()

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-serif text-xl font-bold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          {t("site.title")}
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav.posts")}
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav.about")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
