"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import useSWR from "swr"

interface User {
  id: number
  username: string
  displayName: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (r.status === 401) return { authenticated: false }
    return r.json()
  })

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, mutate } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  const user: User | null = data?.authenticated ? data.user : null

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const result = await res.json()
    if (result.success) {
      await mutate()
      return { success: true }
    }
    return { success: false, error: result.error || "Login failed" }
  }, [mutate])

  const register = useCallback(async (username: string, password: string, displayName: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, displayName }),
    })
    const result = await res.json()
    if (result.success) {
      await mutate()
      return { success: true }
    }
    return { success: false, error: result.error || "Registration failed" }
  }, [mutate])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    await mutate({ authenticated: false }, false)
  }, [mutate])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
