"use client"

import { useI18n } from "@/lib/i18n-context"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      className="flex items-center gap-1 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`Switch to ${locale === "en" ? "Chinese" : "English"}`}
    >
      <Languages className="h-4 w-4" />
    </button>
  )
}
