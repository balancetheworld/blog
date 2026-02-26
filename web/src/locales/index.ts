import en from './en'
import zh from './zh'

export const locales = {
  en,
  zh,
} as const

export type Locale = keyof typeof locales
export type LocaleMessages = typeof locales.en
