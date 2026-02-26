import api from './api'
import type { ApiResponse, CommentWithUser, CreateCommentRequest } from '../types'

export const commentService = {
  getComments: (articleType: 'post' | 'note', articleId: number): Promise<ApiResponse<CommentWithUser[]>> => {
    return api.get(`/api/comments/${articleType}/${articleId}`)
  },

  createComment: (data: CreateCommentRequest): Promise<ApiResponse<{ id: number }>> => {
    return api.post('/api/comments', data)
  },

  deleteComment: (id: number): Promise<ApiResponse> => {
    return api.delete(`/api/comments/${id}`)
  },
}
