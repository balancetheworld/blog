import axios, { type AxiosError } from 'axios'
import type { ApiResponse } from '../types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  withCredentials: true, // Important: support cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Session cookie will be sent automatically
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data as ApiResponse,
  (error: AxiosError<{ error?: string }>) => {
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error'
    return Promise.reject({
      success: false,
      error: errorMessage,
    } as ApiResponse)
  }
)

export default api
