'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { locales } from '@/locales'

type Locale = 'en' | 'zh'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

// 获取嵌套对象属性的工具函数
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) || path
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh')

  // Load locale from localStorage on mount
  useEffect(() => {
    const saved = globalThis.localStorage?.getItem('blog-locale')
    if (saved === 'en' || saved === 'zh') {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    globalThis.localStorage?.setItem('blog-locale', newLocale)
  }, [])

  const t = useCallback(
    (key: string) => {
      const messages = locales[locale]
      return getNestedValue(messages, key)
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading: false }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
