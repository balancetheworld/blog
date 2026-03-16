import api from './api'
import type { ApiResponse, LoginRequest, RegisterRequest, User } from '../types'

export const authService = {
  login: (data: LoginRequest): Promise<ApiResponse<User>> => {
    return api.post('/api/auth/login', data)
  },

  register: (data: RegisterRequest): Promise<ApiResponse> => {
    return api.post('/api/auth/register', data)
  },

  logout: (): Promise<ApiResponse> => {
    return api.post('/api/auth/logout')
  },

  me: (): Promise<ApiResponse<User>> => {
    return api.get('/api/auth/me')
  },

  // ========== 邮箱认证相关 API ==========

  /** 邮箱注册 */
  registerWithEmail: (data: { email: string; password: string; displayName: string }): Promise<ApiResponse> => {
    return api.post('/api/auth/register-email', data)
  },

  /** 邮箱登录 */
  loginWithEmail: (data: { email: string; password: string }): Promise<ApiResponse<User>> => {
    return api.post('/api/auth/login-email', data)
  },

  /** 验证邮箱 */
  verifyEmail: (data: { token: string }): Promise<ApiResponse> => {
    return api.post('/api/auth/verify-email', data)
  },

  /** 重新发送验证邮件 */
  resendVerification: (data: { email: string }): Promise<ApiResponse> => {
    return api.post('/api/auth/resend-verification', data)
  },

  /** 请求密码重置 */
  forgotPassword: (data: { email: string }): Promise<ApiResponse> => {
    return api.post('/api/auth/forgot-password', data)
  },

  /** 重置密码 */
  resetPassword: (data: { token: string; newPassword: string }): Promise<ApiResponse> => {
    return api.post('/api/auth/reset-password', data)
  },

  /** 请求更换邮箱 */
  requestEmailChange: (data: { newEmail: string }): Promise<ApiResponse> => {
    return api.post('/api/auth/request-email-change', data)
  },

  /** 验证新邮箱 */
  verifyEmailChange: (data: { token: string }): Promise<ApiResponse> => {
    return api.post('/api/auth/verify-email-change', data)
  },

  /** 取消邮箱更换 */
  cancelEmailChange: (): Promise<ApiResponse> => {
    return api.post('/api/auth/cancel-email-change')
  },
}
