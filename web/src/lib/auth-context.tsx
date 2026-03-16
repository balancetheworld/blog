'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import useSWR from 'swr'
import { authService } from '../services'
import type { AuthContextType, AuthUser } from '@/types/contexts'

const AuthContext = createContext<AuthContextType | null>(null)

const fetcher = async () => {
  try {
    const response = await authService.me()
    return response
  } catch {
    return { authenticated: false, user: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, mutate } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
    shouldRetryOnError: false,
  })

  const user: AuthUser | null = data?.data ?? null

  const login = useCallback(async (username: string, password: string) => {
    try {
      const result = await authService.login({ username, password })
      if (result.success) {
        await mutate()
        return { success: true }
      }
      return { success: false, error: result.error || 'Login failed' }
    } catch (error) {
      return { success: false, error: (error as Error).message || 'Login failed' }
    }
  }, [mutate])

  const register = useCallback(async (username: string, password: string, displayName: string) => {
    try {
      const result = await authService.register({ username, password, displayName })
      if (result.success) {
        await mutate()
        return { success: true }
      }
      return { success: false, error: result.error || 'Registration failed' }
    } catch (error) {
      return { success: false, error: (error as Error).message || 'Registration failed' }
    }
  }, [mutate])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore logout errors
    }
    await mutate({ data: null }, false)
  }, [mutate])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        emailVerified: user?.emailVerified ?? false,
        login,
        register,
        logout,
        refresh: () => mutate(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
