import { getDatabase } from '../database/connection'

export interface User {
  id: number
  username: string
  password_hash: string
  display_name: string
  role: string
  created_at: string
  email?: string
  email_verified?: number
  email_verification_token?: string
  email_verification_expires?: string
  password_reset_token?: string
  password_reset_expires?: string
  new_email?: string
  new_email_verification_token?: string
  new_email_expires?: string
}

export interface Session {
  id: number
  token: string
  user_id: number
  expires_at: string
}

export const UserModel = {
  findByUsername: (username: string): User | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username)
    return result as User | undefined
  },

  findById: (id: number): User | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id)
    return result as User | undefined
  },

  create: (user: Omit<User, 'id' | 'created_at'>): number => {
    const db = getDatabase()
    const info = db.prepare(
      'INSERT INTO admin_users (username, password_hash, display_name, role, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(user.username, user.password_hash, user.display_name, user.role, new Date().toISOString())
    return info.lastInsertRowid as number
  },

  createSession: (userId: number, token: string, expiresAt: string): number => {
    const db = getDatabase()
    const info = db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt)
    return info.lastInsertRowid as number
  },

  findSessionByToken: (token: string): Session | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token)
    return result as Session | undefined
  },

  deleteSession: (token: string): void => {
    const db = getDatabase()
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
  },

  cleanExpiredSessions: (): void => {
    const db = getDatabase()
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString())
  },

  // ========== 邮箱相关方法 ==========

  // 通过邮箱查找用户
  findByEmail: (email: string): User | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email)
    return result as User | undefined
  },

  // 通过邮箱验证 token 查找用户
  findByEmailVerificationToken: (token: string): User | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM admin_users WHERE email_verification_token = ?').get(token)
    return result as User | undefined
  },

  // 通过密码重置 token 查找用户
  findByPasswordResetToken: (token: string): User | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM admin_users WHERE password_reset_token = ?').get(token)
    return result as User | undefined
  },

  // 通过新邮箱验证 token 查找用户
  findByNewEmailVerificationToken: (token: string): User | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM admin_users WHERE new_email_verification_token = ?').get(token)
    return result as User | undefined
  },

  // 创建用户（邮箱注册）
  createWithEmail: (user: Omit<User, 'id' | 'created_at'>): number => {
    const db = getDatabase()
    const info = db.prepare(
      `INSERT INTO admin_users (username, password_hash, display_name, role, created_at, email, email_verified, email_verification_token, email_verification_expires)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      user.username || null,
      user.password_hash,
      user.display_name,
      user.role,
      new Date().toISOString(),
      user.email || null,
      user.email_verified || 0,
      user.email_verification_token || null,
      user.email_verification_expires || null
    )
    return info.lastInsertRowid as number
  },

  // 更新邮箱验证状态
  updateEmailVerification: (userId: number, verified: boolean): void => {
    const db = getDatabase()
    db.prepare(
      'UPDATE admin_users SET email_verified = ?, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?'
    ).run(verified ? 1 : 0, userId)
  },

  // 设置邮箱验证 token
  setEmailVerificationToken: (userId: number, token: string, expiresAt: string): void => {
    const db = getDatabase()
    db.prepare(
      'UPDATE admin_users SET email_verification_token = ?, email_verification_expires = ? WHERE id = ?'
    ).run(token, expiresAt, userId)
  },

  // 设置密码重置 token
  setPasswordResetToken: (email: string, token: string, expiresAt: string): void => {
    const db = getDatabase()
    db.prepare(
      'UPDATE admin_users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?'
    ).run(token, expiresAt, email)
  },

  // 重置密码
  resetPassword: (token: string, newPasswordHash: string): void => {
    const db = getDatabase()
    db.prepare(
      'UPDATE admin_users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE password_reset_token = ?'
    ).run(newPasswordHash, token)
  },

  // 发起邮箱更换
  initiateEmailChange: (userId: number, newEmail: string, token: string, expiresAt: string): void => {
    const db = getDatabase()
    db.prepare(
      'UPDATE admin_users SET new_email = ?, new_email_verification_token = ?, new_email_expires = ? WHERE id = ?'
    ).run(newEmail, token, expiresAt, userId)
  },

  // 完成邮箱更换
  completeEmailChange: (userId: number, newEmail: string): void => {
    const db = getDatabase()
    db.prepare(
      'UPDATE admin_users SET email = ?, email_verified = 1, new_email = NULL, new_email_verification_token = NULL, new_email_expires = NULL WHERE id = ?'
    ).run(newEmail, userId)
  },

  // 取消邮箱更换
  cancelEmailChange: (userId: number): void => {
    const db = getDatabase()
    db.prepare(
      'UPDATE admin_users SET new_email = NULL, new_email_verification_token = NULL, new_email_expires = NULL WHERE id = ?'
    ).run(userId)
  },

  // 检查邮箱是否已存在（排除指定用户）
  emailExists: (email: string, excludeUserId?: number): boolean => {
    const db = getDatabase()
    let query = 'SELECT COUNT(*) as count FROM admin_users WHERE email = ?'
    const params: (string | number)[] = [email]

    if (excludeUserId !== undefined) {
      query += ' AND id != ?'
      params.push(excludeUserId)
    }

    const result = db.prepare(query).get(...params) as { count: number }
    return result.count > 0
  },
}
