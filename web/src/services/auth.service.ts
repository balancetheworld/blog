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
}
