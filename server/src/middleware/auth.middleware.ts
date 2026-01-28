import { authService } from '../services/auth.service'
import type { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: string
    username: string
    name: string
    avatar?: string
  }
}

/**
 * 验证请求是否已认证
 */
export async function getAuthUser(req: AuthRequest): Promise<AuthRequest['user'] | null> {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '') ||
                  req.headers['x-auth-token'] as string ||
                  req.cookies?.auth_token

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
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const user = await getAuthUser(req)

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  req.user = user
  next()
}

/**
 * 可选认证的中间件
 * 附加用户信息到请求（如果已认证）
 */
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const user = await getAuthUser(req)
  if (user) {
    req.user = user
  }
  next()
}
