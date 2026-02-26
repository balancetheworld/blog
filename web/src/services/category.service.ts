import api from './api'
import type { ApiResponse, Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types'

export const categoryService = {
  getCategories: (): Promise<ApiResponse<Category[]>> => {
    return api.get('/api/categories')
  },

  createCategory: (data: CreateCategoryRequest): Promise<ApiResponse<Category>> => {
    return api.post('/api/admin/categories', data)
  },

  updateCategory: (id: number, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> => {
    return api.put(`/api/admin/categories/${id}`, data)
  },

  deleteCategory: (id: number): Promise<ApiResponse> => {
    return api.delete(`/api/admin/categories/${id}`)
  },
}
