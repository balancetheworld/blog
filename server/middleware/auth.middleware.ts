import { cookies } from 'next/headers'
import { authService } from '@/server/services/auth.service'
import { NextResponse } from 'next/server'

export interface AuthContext {
  user: {
    id: string
    username: string
    name: string
    avatar?: string
  }
}

/**
 * 验证请求是否已认证
 * @returns 用户信息或 null
 */
export async function getAuthUser(): Promise<AuthContext['user'] | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return null
    }

    const user = await authService.verifySession(token)
    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

/**
 * 要求认证的中间件
 * 如果未认证，返回 401 响应
 */
export async function requireAuth(): Promise<NextResponse | AuthContext['user']> {
  const user = await getAuthUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return user
}

/**
 * 检查是否已认证（用于 API 路由）
 * 返回一个包含 check 和 getUser 函数的对象
 */
export function withAuth() {
  return {
    /**
     * 检查认证状态
     */
    async check() {
      const user = await getAuthUser()
      if (!user) {
        throw new Error('Unauthorized')
      }
      return user
    },

    /**
     * 获取用户（可能为 null）
     */
    async get() {
      return getAuthUser()
    }
  }
}
