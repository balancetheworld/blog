import type { Context, Next } from 'koa'
import { UserModel } from '../models/user.model'

const SESSION_COOKIE = 'blog_session'

interface SessionState {
  authenticated: boolean
  userId?: number
  username?: string
  displayName?: string
  role?: string
}

function verifySessionFromToken(token: string): SessionState {
  // Clean expired sessions (统一使用 UserModel 的方法)
  UserModel.cleanExpiredSessions()

  const session = UserModel.findSessionByToken(token)
  if (!session) {
    return { authenticated: false }
  }

  // Check if session is expired
  if (new Date(session.expires_at) < new Date()) {
    UserModel.deleteSession(token)
    return { authenticated: false }
  }

  const user = UserModel.findById(session.user_id)
  if (!user) {
    return { authenticated: false }
  }

  return {
    authenticated: true,
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role,
  }
}

export async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  const token = ctx.cookies?.get(SESSION_COOKIE)

  if (!token) {
    ctx.status = 401
    ctx.body = {
      success: false,
      error: 'Unauthorized: No session token provided',
    }
    return
  }

  const session = verifySessionFromToken(token)

  if (!session.authenticated) {
    ctx.status = 401
    ctx.body = {
      success: false,
      error: 'Unauthorized: Invalid or expired session',
    }
    return
  }

  // 将用户信息附加到 ctx.state
  ctx.state.user = {
    id: session.userId,
    username: session.username,
    displayName: session.displayName,
    role: session.role,
  }

  await next()
}

// 仅管理员可访问
export async function adminMiddleware(ctx: Context, next: Next): Promise<void> {
  const user = ctx.state.user as { id: number; role: string } | undefined

  if (!user || user.role !== 'admin') {
    ctx.status = 403
    ctx.body = {
      success: false,
      error: 'Forbidden: Admin access required',
    }
    return
  }

  await next()
}

// 可选认证中间件：尝试获取用户信息，但不强制要求登录
// 用于公开 API，以便识别已登录的管理员
export async function optionalAuthMiddleware(ctx: Context, next: Next): Promise<void> {
  const token = ctx.cookies?.get(SESSION_COOKIE)

  if (token) {
    const session = verifySessionFromToken(token)

    if (session.authenticated) {
      // 将用户信息附加到 ctx.state
      ctx.state.user = {
        id: session.userId,
        username: session.username,
        displayName: session.displayName,
        role: session.role,
      }
    }
  }

  // 无论是否认证，都继续执行
  await next()
}

export { SESSION_COOKIE }
