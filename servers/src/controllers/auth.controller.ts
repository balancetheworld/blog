import type { Context } from 'koa'
import { AuthService } from '../services/auth.service'
import { UserModel } from '../models/user.model'
import { sendEmailVerificationCode, verifyEmailCode } from '../services/verification.service'

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

    // 获取完整的用户信息（包括邮箱相关字段）
    const fullUser = UserModel.findById(user.id)

    ctx.body = {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        email: fullUser?.email,
        emailVerified: fullUser?.email_verified === 1,
        newEmail: fullUser?.new_email,
      },
    }
  },

  // ========== 邮箱认证相关控制器 ==========

  /**
   * 邮箱注册
   */
  registerWithEmail: async (ctx: Context) => {
    const { email, password, displayName } = ctx.request.body as {
      email: string
      password: string
      displayName: string
    }

    if (!email || !password || !displayName) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing required fields' }
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Invalid email format' }
      return
    }

    // 验证密码长度
    if (password.length < 6) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Password must be at least 6 characters' }
      return
    }

    try {
      const result = await AuthService.registerWithEmail(email, password, displayName)
      ctx.body = {
        success: true,
        data: {
          userId: result.userId,
          message: 'Registration successful. Please check your email to verify your account.',
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

  /**
   * 验证邮箱
   */
  verifyEmail: async (ctx: Context) => {
    const { token } = ctx.request.body as { token: string }

    if (!token) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing verification token' }
      return
    }

    const result = AuthService.verifyEmail(token)

    if (!result.success) {
      ctx.status = 400
      ctx.body = { success: false, error: result.error }
      return
    }

    ctx.body = {
      success: true,
      message: 'Email verified successfully. You can now log in.',
    }
  },

  /**
   * 重新发送验证邮件
   */
  resendVerification: async (ctx: Context) => {
    const { email } = ctx.request.body as { email: string }

    if (!email) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing email address' }
      return
    }

    const result = await AuthService.resendVerification(email)

    if (!result.success) {
      ctx.status = 400
      ctx.body = { success: false, error: result.error }
      return
    }

    ctx.body = {
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    }
  },

  /**
   * 请求密码重置
   */
  forgotPassword: async (ctx: Context) => {
    const { email } = ctx.request.body as { email: string }

    if (!email) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing email address' }
      return
    }

    const result = await AuthService.forgotPassword(email)

    ctx.body = {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    }
  },

  /**
   * 重置密码
   */
  resetPassword: async (ctx: Context) => {
    const { token, newPassword } = ctx.request.body as { token: string; newPassword: string }

    if (!token || !newPassword) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing token or new password' }
      return
    }

    // 验证密码长度
    if (newPassword.length < 6) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Password must be at least 6 characters' }
      return
    }

    const result = await AuthService.resetPassword(token, newPassword)

    if (!result.success) {
      ctx.status = 400
      ctx.body = { success: false, error: result.error }
      return
    }

    ctx.body = {
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    }
  },

  /**
   * 请求更换邮箱
   */
  requestEmailChange: async (ctx: Context) => {
    const user = ctx.state.user as { id: number }
    if (!user) {
      ctx.status = 401
      ctx.body = { success: false, error: 'Unauthorized' }
      return
    }

    const { newEmail } = ctx.request.body as { newEmail: string }

    if (!newEmail) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing new email address' }
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Invalid email format' }
      return
    }

    const result = await AuthService.requestEmailChange(user.id, newEmail)

    if (!result.success) {
      ctx.status = 400
      ctx.body = { success: false, error: result.error }
      return
    }

    ctx.body = {
      success: true,
      message: 'A verification email has been sent to your new email address.',
    }
  },

  /**
   * 验证新邮箱
   */
  verifyEmailChange: async (ctx: Context) => {
    const { token } = ctx.request.body as { token: string }

    if (!token) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing verification token' }
      return
    }

    const result = AuthService.verifyEmailChange(token)

    if (!result.success) {
      ctx.status = 400
      ctx.body = { success: false, error: result.error }
      return
    }

    ctx.body = {
      success: true,
      message: 'Email changed successfully.',
    }
  },

  /**
   * 取消邮箱更换
   */
  cancelEmailChange: async (ctx: Context) => {
    const user = ctx.state.user as { id: number }
    if (!user) {
      ctx.status = 401
      ctx.body = { success: false, error: 'Unauthorized' }
      return
    }

    AuthService.cancelEmailChange(user.id)

    ctx.body = {
      success: true,
      message: 'Email change request cancelled.',
    }
  },

  /**
   * 邮箱登录
   */
  loginWithEmail: async (ctx: Context) => {
    const { email, password } = ctx.request.body as { email: string; password: string }

    if (!email || !password) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing email or password' }
      return
    }

    try {
      const result = await AuthService.loginWithEmail(email, password)
      setAuthCookie(ctx, result.token)

      ctx.body = {
        success: true,
        data: {
          userId: result.userId,
          displayName: result.displayName,
          role: result.role,
          emailVerified: result.emailVerified,
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

  /**
   * 发送邮箱验证码
   */
  sendVerificationCode: async (ctx: Context) => {
    const { email } = ctx.request.body as { email: string }

    if (!email) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing email address' }
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Invalid email format' }
      return
    }

    // 发送验证码
    const result = await sendEmailVerificationCode(email)

    if (!result.success) {
      ctx.status = 400
      ctx.body = { success: false, error: result.error }
      return
    }

    ctx.body = {
      success: true,
      message: 'Verification code sent successfully',
    }
  },

  /**
   * 验证邮箱验证码
   */
  verifyEmailCode: async (ctx: Context) => {
    const { email, code } = ctx.request.body as { email: string; code: string }

    if (!email || !code) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Missing email or code' }
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Invalid email format' }
      return
    }

    // 验证码长度检查
    if (code.length !== 6) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Invalid code format' }
      return
    }

    // 验证验证码
    const result = verifyEmailCode(email, code)

    if (!result.success) {
      ctx.status = 400
      ctx.body = { success: false, error: result.error }
      return
    }

    ctx.body = {
      success: true,
      message: 'Email verified successfully',
    }
  },
}

export type AuthControllerType = typeof authController
