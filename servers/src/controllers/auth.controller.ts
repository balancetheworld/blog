import type { Context } from 'koa'
import { AuthService } from '../services/auth.service'

// Cookie secure 配置
// 在 Docker 内部网络场景下，前端通过 HTTP 访问后端，此时不能使用 secure cookie
// 使用 COOKIE_SECURE 环境变量显式控制，默认为 false
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true'

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
        secure: COOKIE_SECURE,
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
    console.log('[CONTROLLER] Login request received, body:', ctx.request.body)
    const { username, password } = ctx.request.body as { username: string; password: string }

    if (!username || !password) {
      console.log('[CONTROLLER] Missing username or password')
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing username or password' }
      return
    }

    try {
      console.log('[CONTROLLER] Calling AuthService.login')
      const result = await AuthService.login(username, password)
      console.log('[CONTROLLER] AuthService.login returned:', result)

      // Set cookie
      ctx.cookies.set('blog_session', result.token, {
        httpOnly: true,
        secure: COOKIE_SECURE,
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
      console.log('[CONTROLLER] Error caught:', error)
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
      secure: COOKIE_SECURE,
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
