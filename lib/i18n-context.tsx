"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import useSWR from "swr"

type Locale = "en" | "zh"

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

const API_BASE = "/api"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh")

  // Load locale from localStorage on mount
  useEffect(() => {
    const saved = globalThis.localStorage?.getItem("blog-locale")
    if (saved === "en" || saved === "zh") {
      setLocaleState(saved)
    }
  }, [])

  const { data, isLoading } = useSWR(`${API_BASE}/i18n/${locale}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  const labels = data?.data || {}

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    globalThis.localStorage?.setItem("blog-locale", newLocale)
  }, [])

  const t = useCallback(
    (key: string) => {
      return labels[key] || key
    },
    [labels]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
