import { UserModel } from '../models/user.model'
import { config } from '../config'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
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
}
