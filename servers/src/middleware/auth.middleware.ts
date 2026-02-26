import type { Context, Next } from 'koa'
import { getDatabase } from '../database/connection'

const SESSION_COOKIE = 'blog_session'

interface SessionState {
  authenticated: boolean
  userId?: number
  username?: string
  displayName?: string
  role?: string
}

function verifySessionFromToken(token: string): SessionState {
  const db = getDatabase()

  // Clean expired sessions
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString())

  const row = db.prepare(
    `SELECT s.user_id, u.username, u.display_name, u.role
     FROM sessions s
     JOIN admin_users u ON s.user_id = u.id
     WHERE s.token = ? AND s.expires_at > ?`
  ).get(token, new Date().toISOString()) as { user_id: number; username: string; display_name: string; role: string } | undefined

  if (!row) {
    return { authenticated: false }
  }

  return {
    authenticated: true,
    userId: row.user_id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
  }
}

export async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  const token = ctx.cookies.get(SESSION_COOKIE)

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

export { SESSION_COOKIE }
