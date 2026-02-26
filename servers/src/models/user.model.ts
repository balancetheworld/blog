import { getDatabase } from '../database/connection'

export interface User {
  id: number
  username: string
  password_hash: string
  display_name: string
  role: string
  created_at: string
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
}
