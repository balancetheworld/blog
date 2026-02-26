import api from './api'
import type {
  ApiResponse,
  PostWithTranslations,
  ArticleQuery,
  CreateArticleRequest,
  UpdateArticleRequest,
} from '../types'

export const articleService = {
  getArticles: (params: ArticleQuery): Promise<ApiResponse<PostWithTranslations[]>> => {
    const queryParams = new URLSearchParams()
    if (params.lang) queryParams.set('lang', params.lang)
    if (params.category) queryParams.set('category', params.category)
    if (params.sort) queryParams.set('sort', params.sort)
    if (params.q) queryParams.set('q', params.q)

    const query = queryParams.toString()
    return api.get(`/api/articles${query ? `?${query}` : ''}`)
  },

  getArticle: (slug: string): Promise<ApiResponse<PostWithTranslations>> => {
    return api.get(`/api/article/${slug}`)
  },

  createArticle: (data: CreateArticleRequest): Promise<ApiResponse<PostWithTranslations>> => {
    return api.post('/api/admin/articles', data)
  },

  updateArticle: (id: number, data: UpdateArticleRequest): Promise<ApiResponse<PostWithTranslations>> => {
    return api.put(`/api/admin/articles/${id}`, data)
  },

  deleteArticle: (id: number): Promise<ApiResponse> => {
    return api.delete(`/api/admin/articles/${id}`)
  },
}
