import { UserModel } from '../models/user.model'
import { config } from '../config'
import { createHash, randomBytes } from 'crypto'
import { sendVerificationEmail, sendPasswordResetEmail, sendEmailChangeVerification } from './email.service'

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export async function hashPassword(password: string): Promise<string> {
  return createHash('sha256').update(password).digest('hex')
}

export const AuthService = {
  register: async (username: string, password: string, displayName: string): Promise<{ userId: number; token: string }> => {
    // Check if user already exists
    const existingUser = UserModel.findByUsername(username)
    if (existingUser) {
      throw new Error('Username already exists')
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const userId = UserModel.create({
      username,
      password_hash: passwordHash,
      display_name: displayName,
      role: 'admin', // Default to admin for simplicity
    })

    // Create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    UserModel.createSession(userId, token, expiresAt)

    return { userId, token }
  },

  login: async (username: string, password: string): Promise<{ userId: number; token: string; displayName: string; role: string }> => {
    // Find user
    const user = UserModel.findByUsername(username)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const passwordHash = await hashPassword(password)
    if (passwordHash !== user.password_hash) {
      throw new Error('Invalid credentials')
    }

    // Clean expired sessions
    UserModel.cleanExpiredSessions()

    // Create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    UserModel.createSession(user.id, token, expiresAt)

    return {
      userId: user.id,
      token,
      displayName: user.display_name,
      role: user.role,
    }
  },

  verifyToken: (token: string): { authenticated: boolean; userId?: number; username?: string; displayName?: string; role?: string } => {
    // Clean expired sessions first
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
  },

  logout: (token: string): void => {
    UserModel.deleteSession(token)
  },

  getUserById: (id: number) => {
    return UserModel.findById(id)
  },

  // ========== 邮箱认证相关方法 ==========

  /**
   * 邮箱注册
   */
  registerWithEmail: async (email: string, password: string, displayName: string): Promise<{ userId: number }> => {
    // 检查邮箱是否已存在
    const existingUser = UserModel.findByEmail(email)
    if (existingUser) {
      throw new Error('Email already exists')
    }

    // 生成用户名（使用邮箱前缀）
    const username = email.split('@')[0] + '_' + randomBytes(4).toString('hex')

    // 检查用户名是否已存在，如果存在则递归生成新的
    const ensureUniqueUsername = (base: string, attempts = 0): string => {
      if (attempts > 10) {
        throw new Error('Failed to generate unique username')
      }
      const candidate = attempts === 0 ? base : `${base}_${attempts}`
      if (UserModel.findByUsername(candidate)) {
        return ensureUniqueUsername(base, attempts + 1)
      }
      return candidate
    }

    const uniqueUsername = ensureUniqueUsername(username)

    // 哈希密码
    const passwordHash = await hashPassword(password)

    // 生成验证 token（7天有效）
    const verificationToken = generateToken()
    const verificationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // 创建用户（邮箱未验证状态）
    const userId = UserModel.createWithEmail({
      username: uniqueUsername,
      password_hash: passwordHash,
      display_name: displayName,
      role: 'user', // 邮箱注册默认为普通用户
      email,
      email_verified: 0,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires,
    })

    // 发送验证邮件
    await sendVerificationEmail(email, verificationToken)

    return { userId }
  },

  /**
   * 验证邮箱
   */
  verifyEmail: (token: string): { success: boolean; error?: string } => {
    const user = UserModel.findByEmailVerificationToken(token)
    if (!user) {
      return { success: false, error: 'Invalid or expired verification token' }
    }

    // 检查 token 是否过期
    if (user.email_verification_expires && new Date(user.email_verification_expires) < new Date()) {
      return { success: false, error: 'Verification token has expired' }
    }

    // 更新验证状态
    UserModel.updateEmailVerification(user.id, true)

    return { success: true }
  },

  /**
   * 重新发送验证邮件
   */
  resendVerification: async (email: string): Promise<{ success: boolean; error?: string }> => {
    const user = UserModel.findByEmail(email)
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    if (user.email_verified === 1) {
      return { success: false, error: 'Email is already verified' }
    }

    // 生成新的验证 token（7天有效）
    const verificationToken = generateToken()
    const verificationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // 更新验证 token
    UserModel.setEmailVerificationToken(user.id, verificationToken, verificationExpires)

    // 发送验证邮件
    const result = await sendVerificationEmail(email, verificationToken)

    return result
  },

  /**
   * 请求密码重置
   */
  forgotPassword: async (email: string): Promise<{ success: boolean; error?: string }> => {
    const user = UserModel.findByEmail(email)
    if (!user) {
      // 为了安全，即使用户不存在也返回成功，防止邮箱枚举攻击
      console.log(`Password reset requested for non-existent email: ${email}`)
      return { success: true }
    }

    // 生成重置 token（1小时有效）
    const resetToken = generateToken()
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    // 设置重置 token
    UserModel.setPasswordResetToken(email, resetToken, resetExpires)

    // 发送重置邮件
    const result = await sendPasswordResetEmail(email, resetToken)

    return result
  },

  /**
   * 重置密码
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const user = UserModel.findByPasswordResetToken(token)
    if (!user) {
      return { success: false, error: 'Invalid or expired reset token' }
    }

    // 检查 token 是否过期
    if (user.password_reset_expires && new Date(user.password_reset_expires) < new Date()) {
      return { success: false, error: 'Reset token has expired' }
    }

    // 哈希新密码
    const passwordHash = await hashPassword(newPassword)

    // 重置密码
    UserModel.resetPassword(token, passwordHash)

    return { success: true }
  },

  /**
   * 请求更换邮箱
   */
  requestEmailChange: async (userId: number, newEmail: string): Promise<{ success: boolean; error?: string }> => {
    // 检查新邮箱是否已被使用
    if (UserModel.emailExists(newEmail, userId)) {
      return { success: false, error: 'Email already in use' }
    }

    // 生成验证 token（7天有效）
    const verificationToken = generateToken()
    const verificationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // 保存新邮箱和验证 token
    UserModel.initiateEmailChange(userId, newEmail, verificationToken, verificationExpires)

    // 发送验证邮件到新邮箱
    const result = await sendEmailChangeVerification(newEmail, verificationToken)

    return result
  },

  /**
   * 验证新邮箱
   */
  verifyEmailChange: (token: string): { success: boolean; error?: string } => {
    const user = UserModel.findByNewEmailVerificationToken(token)
    if (!user) {
      return { success: false, error: 'Invalid or expired verification token' }
    }

    // 检查 token 是否过期
    if (user.new_email_expires && new Date(user.new_email_expires) < new Date()) {
      return { success: false, error: 'Verification token has expired' }
    }

    if (!user.new_email) {
      return { success: false, error: 'No email change request found' }
    }

    // 完成邮箱更换
    UserModel.completeEmailChange(user.id, user.new_email)

    return { success: true }
  },

  /**
   * 取消邮箱更换
   */
  cancelEmailChange: (userId: number): void => {
    UserModel.cancelEmailChange(userId)
  },

  /**
   * 通过邮箱登录
   */
  loginWithEmail: async (email: string, password: string): Promise<{ userId: number; token: string; displayName: string; role: string; emailVerified?: number }> => {
    // 查找用户
    const user = UserModel.findByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    // 验证密码
    const passwordHash = await hashPassword(password)
    if (passwordHash !== user.password_hash) {
      throw new Error('Invalid credentials')
    }

    // 清理过期会话
    UserModel.cleanExpiredSessions()

    // 创建会话
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    UserModel.createSession(user.id, token, expiresAt)

    return {
      userId: user.id,
      token,
      displayName: user.display_name,
      role: user.role,
      emailVerified: user.email_verified,
    }
  },
}
