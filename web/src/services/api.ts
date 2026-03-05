import axios, { type AxiosError } from 'axios'
  import type { ApiResponse } from '../types'

  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'
  const isServer = typeof window === 'undefined'

  const API_PREFIX_SERVER = '/api'
  const API_PREFIX_BROWSER = ''

  const api = axios.create({
    baseURL: isServer ? `${BACKEND_URL}${API_PREFIX_SERVER}` : API_PREFIX_BROWSER,
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  )

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
