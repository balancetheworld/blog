import api from './api'
import type { ApiResponse, Recently, CreateRecentlyRequest, UpdateRecentlyRequest } from '../types'

export const recentlyService = {
  getRecently: (): Promise<ApiResponse<Recently[]>> => {
    return api.get('/api/recently')
  },

  createRecently: (data: CreateRecentlyRequest): Promise<ApiResponse<Recently>> => {
    return api.post('/api/admin/recently', data)
  },

  updateRecently: (id: number, data: UpdateRecentlyRequest): Promise<ApiResponse<Recently>> => {
    return api.put(`/api/admin/recently/${id}`, data)
  },

  deleteRecently: (id: number): Promise<ApiResponse> => {
    return api.delete(`/api/admin/recently/${id}`)
  },
}
