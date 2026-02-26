import api from './api'
import type { ApiResponse, Profile } from '../types'

export const profileService = {
  getProfile: (): Promise<ApiResponse<Profile>> => {
    return api.get('/api/profile')
  },

  updateProfile: (data: Partial<Omit<Profile, 'id'>>): Promise<ApiResponse<Profile>> => {
    return api.put('/api/admin/profile', data)
  },
}
