import type { Context } from 'koa'
import { UserModel } from '../models/user.model'
import { hashPassword, generateToken } from '../services/auth.service'
import { sendVerificationEmail } from '../services/email.service'

/**
 * 获取所有用户列表
 */
export const getAllUsers = async (ctx: Context) => {
  try {
    const db = require('../database/connection').getDatabase()

    // 获取用户列表，包含邮箱和验证状态
    const users = db
      .prepare(`
        SELECT id, username, email, display_name, role, email_verified, created_at
        FROM admin_users
        ORDER BY created_at DESC
      `)
      .all()

    ctx.body = {
      success: true,
      data: users.map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        displayName: u.display_name,
        role: u.role,
        emailVerified: u.email_verified === 1,
        createdAt: u.created_at,
      })),
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = { success: false, error: 'Failed to fetch users' }
  }
}

/**
 * 获取单个用户详情
 */
export const getUserById = async (ctx: Context) => {
  const { id } = ctx.params

  try {
    const db = require('../database/connection').getDatabase()
    const user = db
      .prepare(`
        SELECT id, username, email, display_name, role, email_verified, new_email, created_at
        FROM admin_users
        WHERE id = ?
      `)
      .get(id)

    if (!user) {
      ctx.status = 404
      ctx.body = { success: false, error: 'User not found' }
      return
    }

    ctx.body = {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        emailVerified: user.email_verified === 1,
        newEmail: user.new_email,
        createdAt: user.created_at,
      },
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = { success: false, error: 'Failed to fetch user' }
  }
}

/**
 * 更新用户信息
 */
export const updateUser = async (ctx: Context) => {
  const { id } = ctx.params
  const { displayName, role, emailVerified } = ctx.request.body as {
    displayName?: string
    role?: string
    emailVerified?: boolean
  }

  if (!displayName && !role && emailVerified === undefined) {
    ctx.status = 400
    ctx.body = { success: false, error: 'No fields to update' }
    return
  }

  try {
    const db = require('../database/connection').getDatabase()

    // 构建更新语句
    const updates: string[] = []
    const values: (string | number)[] = []

    if (displayName !== undefined) {
      updates.push('display_name = ?')
      values.push(displayName)
    }
    if (role !== undefined) {
      if (!['admin', 'user'].includes(role)) {
        ctx.status = 400
        ctx.body = { success: false, error: 'Invalid role' }
        return
      }
      updates.push('role = ?')
      values.push(role)
    }
    if (emailVerified !== undefined) {
      updates.push('email_verified = ?')
      values.push(emailVerified ? 1 : 0)
    }

    if (updates.length === 0) {
      ctx.status = 400
      ctx.body = { success: false, error: 'No fields to update' }
      return
    }

    values.push(id)

    db.prepare(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`).run(...values)

    ctx.body = { success: true, message: 'User updated successfully' }
  } catch (error) {
    ctx.status = 500
    ctx.body = { success: false, error: 'Failed to update user' }
  }
}

/**
 * 删除用户
 */
export const deleteUser = async (ctx: Context) => {
  const { id } = ctx.params
  const currentUserId = (ctx.state.user as { id: number }).id

  // 不允许删除自己
  if (parseInt(id) === currentUserId) {
    ctx.status = 400
    ctx.body = { success: false, error: 'Cannot delete yourself' }
    return
  }

  try {
    const db = require('../database/connection').getDatabase()

    // 删除用户（级联删除会话、评论、点赞等）
    db.prepare('DELETE FROM admin_users WHERE id = ?').run(id)

    ctx.body = { success: true, message: 'User deleted successfully' }
  } catch (error) {
    ctx.status = 500
    ctx.body = { success: false, error: 'Failed to delete user' }
  }
}

/**
 * 管理员创建用户
 */
export const createUser = async (ctx: Context) => {
  const { email, password, displayName, role } = ctx.request.body as {
    email: string
    password: string
    displayName: string
    role?: string
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
    // 检查邮箱是否已存在
    const existingUser = UserModel.findByEmail(email)
    if (existingUser) {
      ctx.status = 409
      ctx.body = { success: false, error: 'Email already exists' }
      return
    }

    // 生成用户名（使用邮箱前缀 + 随机字符）
    const username = email.split('@')[0] + '_' + generateToken().substring(0, 8)

    const passwordHash = await hashPassword(password)

    const db = require('../database/connection').getDatabase()

    // 创建已验证的用户（管理员创建的用户直接验证通过）
    const info = db
      .prepare(
        `INSERT INTO admin_users (username, password_hash, display_name, role, email, email_verified, created_at)
         VALUES (?, ?, ?, ?, ?, 1, ?)`
      )
      .run(username, passwordHash, displayName, role || 'user', email, new Date().toISOString())

    ctx.body = {
      success: true,
      data: { userId: info.lastInsertRowid as number },
      message: 'User created successfully',
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = { success: false, error: 'Failed to create user' }
  }
}

/**
 * 重置用户密码
 */
export const resetUserPassword = async (ctx: Context) => {
  const { id } = ctx.params
  const { newPassword } = ctx.request.body as { newPassword: string }

  if (!newPassword || newPassword.length < 6) {
    ctx.status = 400
    ctx.body = { success: false, error: 'Password must be at least 6 characters' }
    return
  }

  try {
    const passwordHash = await hashPassword(newPassword)
    const db = require('../database/connection').getDatabase()

    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(passwordHash, id)

    ctx.body = { success: true, message: 'Password reset successfully' }
  } catch (error) {
    ctx.status = 500
    ctx.body = { success: false, error: 'Failed to reset password' }
  }
}

/**
 * 重新发送验证邮件
 */
export const resendUserVerification = async (ctx: Context) => {
  const { id } = ctx.params

  try {
    const db = require('../database/connection').getDatabase()
    const user = db.prepare('SELECT id, email, email_verified FROM admin_users WHERE id = ?').get(id)

    if (!user) {
      ctx.status = 404
      ctx.body = { success: false, error: 'User not found' }
      return
    }

    if (user.email_verified === 1) {
      ctx.status = 400
      ctx.body = { success: false, error: 'Email is already verified' }
      return
    }

    // 生成新的验证 token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    db.prepare('UPDATE admin_users SET email_verification_token = ?, email_verification_expires = ? WHERE id = ?').run(
      token,
      expiresAt,
      id
    )

    // 发送验证邮件
    await sendVerificationEmail(user.email, token)

    ctx.body = { success: true, message: 'Verification email sent' }
  } catch (error) {
    ctx.status = 500
    ctx.body = { success: false, error: 'Failed to send verification email' }
  }
}

export const userController = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  resetUserPassword,
  resendUserVerification,
}
