import api from './api'
import type { ApiResponse, LikeRequest } from '../types'

export interface LikeResult {
  liked: boolean
  count: number
}

export const likeService = {
  toggleLike: (data: LikeRequest): Promise<ApiResponse<LikeResult>> => {
    return api.post('/api/likes', data)
  },

  getLikeStatus: (articleType: 'post' | 'note', articleId: number): Promise<ApiResponse<LikeResult>> => {
    return api.get(`/api/likes/${articleType}/${articleId}`)
  },
}
