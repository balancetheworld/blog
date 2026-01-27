/**
 * 用户相关类型定义
 */

export interface User {
  id: string
  username: string
  name: string
  avatar?: string
}

export interface LoginInput {
  username: string
  password: string
}

export interface RegisterInput {
  username: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Session {
  id: string
  token: string
  userId: string
  expiresAt: number
  createdAt: number
}
