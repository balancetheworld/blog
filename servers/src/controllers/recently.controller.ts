import type { Context } from 'koa'
import { RecentlyService } from '../services/recently.service'

export const recentlyController = {
  getAll: async (ctx: Context) => {
    try {
      const items = RecentlyService.getAll()
      ctx.body = {
        success: true,
        data: items,
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
    const { content, image_url, images } = ctx.request.body as {
      content: string
      image_url?: string
      images?: string[]
    }

    if (!content) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: 'Missing content',
      }
      return
    }

    try {
      const item = RecentlyService.create(content, image_url, images)
      ctx.body = {
        success: true,
        data: item,
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  update: async (ctx: Context) => {
    const { id } = ctx.params
    const data = ctx.request.body as {
      content?: string
      image_url?: string
      images?: string[]
    }

    try {
      const item = RecentlyService.update(Number(id), data)
      ctx.body = {
        success: true,
        data: item,
      }
    } catch (error) {
      ctx.status = 404
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  delete: async (ctx: Context) => {
    const { id } = ctx.params

    try {
      RecentlyService.delete(Number(id))
      ctx.body = {
        success: true,
        message: 'Thought deleted successfully',
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
