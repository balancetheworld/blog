import type { Context } from 'koa'
import { AuthService } from '../services/auth.service'

// 检查请求是否来自 HTTPS（考虑反向代理）
function isSecureRequest(ctx: Context): boolean {
  // 1. 优先检查 X-Forwarded-Proto 头（由标准反向代理设置）
  const proto = ctx.get('X-Forwarded-Proto')
  if (proto) {
    return proto === 'https'
  }

  // 2. 检查 Cloudflare 头
  const cfVisitor = ctx.get('CF-Visitor')
  if (cfVisitor) {
    try {
      const visitor = JSON.parse(cfVisitor)
      return visitor.scheme === 'https'
    } catch {
      // 解析失败，继续其他检查
    }
  }

  // 3. 检查 X-Forwarded-SSL（一些反向代理使用这个）
  const forwardedSsl = ctx.get('X-Forwarded-SSL')
  if (forwardedSsl) {
    return forwardedSsl === 'on' || forwardedSsl === '1'
  }

  // 4. 检查 Front-End-Https（微软 IIS 使用）
  const feHttps = ctx.get('Front-End-Https')
  if (feHttps) {
    return feHttps.toLowerCase() === 'on'
  }

  // 5. 环境变量显式设置（最高优先级覆盖）
  if (process.env.FORCE_HTTPS === 'true') {
    return true
  }

  // 6. 回退到检查 NODE_ENV（仅用于直接连接）
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
