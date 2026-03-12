// 上下文类型定义

// ============================================================================
// 认证上下文
// ============================================================================

/** 用户信息（AuthContext 使用，与 types/index.ts 中的 User 保持一致） */
export interface AuthUser {
  id: number
  username: string
  displayName: string
  role: string
}

/** 认证上下文类型 */
export interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => void
}

// ============================================================================
// 国际化上下文
// ============================================================================

/** 语言类型 */
export type Locale = 'en' | 'zh'

/** 国际化上下文类型 */
export interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  isLoading: boolean
}
