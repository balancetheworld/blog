import type { Context } from 'koa'
import { AuthService } from '../services/auth.service'

// Cookie secure 配置
// 在 Docker 内部网络场景下，前端通过 HTTP 访问后端，此时不能使用 secure cookie
// 使用 COOKIE_SECURE 环境变量显式控制，默认为 false
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true'

// Cookie 配置常量
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// 设置认证 Cookie 的辅助函数
function setAuthCookie(ctx: Context, token: string): void {
  ctx.cookies.set('blog_session', token, COOKIE_OPTIONS)
}

// 清除认证 Cookie 的辅助函数
function clearAuthCookie(ctx: Context): void {
  ctx.cookies.set('blog_session', '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  })
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
      setAuthCookie(ctx, result.token)

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
      setAuthCookie(ctx, result.token)

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

    clearAuthCookie(ctx)

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
