import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db, users, sessions } from '@/server/db'
import type { User as DBUser, Session as DBSession } from '@/server/db'

export interface LoginInput {
  username: string
  password: string
}

export interface RegisterInput {
  username: string
  password: string
  name: string
}

export interface AuthUser {
  id: string
  username: string
  name: string
  avatar?: string
}

class AuthService {
  /**
   * 用户登录
   */
  async login(input: LoginInput): Promise<{ user: AuthUser; token: string } | null> {
    const { username, password } = input

    // 查找用户
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    })

    if (!user) {
      return null
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return null
    }

    // 创建会话
    const token = this.generateToken()
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7天后过期

    await db.insert(sessions).values({
      id: this.generateId(),
      token,
      userId: user.id,
      expiresAt
    } as any)

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar || undefined
      },
      token
    }
  }

  /**
   * 用户注册
   */
  async register(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
    const { username, password, name } = input

    // 检查用户名是否已存在
    const existing = await db.query.users.findFirst({
      where: eq(users.username, username)
    })

    if (existing) {
      throw new Error('Username already exists')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const userId = this.generateId()
    await db.insert(users).values({
      id: userId,
      username,
      password: hashedPassword,
      name,
      createdAt: new Date()
    } as any)

    // 创建会话
    const token = this.generateToken()
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7天后过期

    await db.insert(sessions).values({
      id: this.generateId(),
      token,
      userId,
      expiresAt
    } as any)

    return {
      user: {
        id: userId,
        username,
        name
      },
      token
    }
  }

  /**
   * 用户登出
   */
  async logout(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token))
  }

  /**
   * 验证会话
   */
  async verifySession(token: string): Promise<AuthUser | null> {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
      with: {
        user: true
      }
    }) as any

    if (!session) {
      return null
    }

    // 检查是否过期
    if (session.expiresAt.getTime() < Date.now()) {
      await db.delete(sessions).where(eq(sessions.token, token))
      return null
    }

    return {
      id: session.user.id,
      username: session.user.username,
      name: session.user.name,
      avatar: session.user.avatar || undefined
    }
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser(token: string): Promise<AuthUser | null> {
    return this.verifySession(token)
  }

  /**
   * 生成随机 ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2)
  }

  /**
   * 生成会话令牌
   */
  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }
}

export const authService = new AuthService()
