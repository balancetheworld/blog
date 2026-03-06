import type { Context } from 'koa'
import { AuthService } from '../services/auth.service'

// 检查请求是否来自 HTTPS（考虑反向代理）
function isSecureRequest(ctx: Context): boolean {
  // 检查 X-Forwarded-Proto 头（由反向代理设置）
  const proto = ctx.get('X-Forwarded-Proto')
  if (proto) {
    return proto === 'https'
  }
  // 回退到检查 NODE_ENV（仅用于直接连接）
  return process.env.NODE_ENV === 'production'
}

export const authController = {
  register: async (ctx: Context) => {
    const { username, password, displayName } = ctx.request.body as {
      username: string
      password: string
      displayName: string
    }

    if (!username || !password || !displayName) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing required fields' }
      return
    }

    try {
      const result = await AuthService.register(username, password, displayName)

      // Set cookie
      ctx.cookies.set('blog_session', result.token, {
        httpOnly: true,
        secure: isSecureRequest(ctx),
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      ctx.body = {
        success: true,
        data: {
          userId: result.userId,
        },
      }
    } catch (error) {
      ctx.status = 409
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  login: async (ctx: Context) => {
    const { username, password } = ctx.request.body as { username: string; password: string }

    if (!username || !password) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing username or password' }
      return
    }

    try {
      const result = await AuthService.login(username, password)

      // Set cookie
      ctx.cookies.set('blog_session', result.token, {
        httpOnly: true,
        secure: isSecureRequest(ctx),
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      ctx.body = {
        success: true,
        data: {
          userId: result.userId,
          displayName: result.displayName,
          role: result.role,
        },
      }
    } catch (error) {
      ctx.status = 401
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  logout: async (ctx: Context) => {
    const token = ctx.cookies.get('blog_session')
    if (token) {
      AuthService.logout(token)
    }

    ctx.cookies.set('blog_session', '', {
      httpOnly: true,
      secure: isSecureRequest(ctx),
      sameSite: 'lax',
      maxAge: 0,
    })

    ctx.body = {
      success: true,
      message: 'Logged out successfully',
    }
  },

  me: async (ctx: Context) => {
    const user = ctx.state.user as { id: number; username: string; displayName: string; role: string }

    if (!user) {
      ctx.status = 401
      ctx.body = { success: false, error: 'Unauthorized' }
      return
    }

    ctx.body = {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    }
  },
}

export type AuthControllerType = typeof authController
