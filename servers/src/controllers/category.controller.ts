import type { Context } from 'koa'
import { CategoryService } from '../services/category.service'

export const categoryController = {
  getAll: async (ctx: Context) => {
    try {
      // 检查是否为管理员（从 state.user 获取）
      const isAdmin = ctx.state.user?.role === 'admin'
      const categories = CategoryService.getAll(isAdmin)
      ctx.body = {
        success: true,
        data: categories,
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  create: async (ctx: Context) => {
    const { slug, name_en, name_zh, sort_order, is_private } = ctx.request.body as {
      slug: string
      name_en: string
      name_zh: string
      sort_order?: number
      is_private?: number
    }

    if (!slug || !name_en || !name_zh) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: 'Missing required fields',
      }
      return
    }

    try {
      const category = CategoryService.create(slug, name_en, name_zh, sort_order, is_private)
      ctx.body = {
        success: true,
        data: category,
      }
    } catch (error) {
      ctx.status = 409
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  update: async (ctx: Context) => {
    const { id } = ctx.params
    const data = ctx.request.body as {
      slug?: string
      name_en?: string
      name_zh?: string
      sort_order?: number
      is_private?: number
    }

    try {
      const category = CategoryService.update(Number(id), data)
      ctx.body = {
        success: true,
        data: category,
      }
    } catch (error) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  delete: async (ctx: Context) => {
    const { id } = ctx.params

    try {
      CategoryService.delete(Number(id))
      ctx.body = {
        success: true,
        message: 'Category deleted successfully',
      }
    } catch (error) {
      ctx.status = 404
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },
}
