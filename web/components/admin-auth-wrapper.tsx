"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter()

  useEffect(() => {
    // 检查是否有 token
    const token = localStorage.getItem('auth_token')

    if (!token) {
      // 没有 token，重定向到登录页
      router.push('/blog/login')
      return
    }

    // 验证 token 是否有效
    fetch('/api/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid token')
        }
        return res.json()
      })
      .catch(() => {
        // token 无效，重定向到登录页
        localStorage.removeItem('auth_token')
        router.push('/blog/login')
      })
  }, [router])

  return <>{children}</>
}
