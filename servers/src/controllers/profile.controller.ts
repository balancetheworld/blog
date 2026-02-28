import type { Context } from 'koa'
import { ProfileService } from '../services/profile.service'

export const profileController = {
  get: async (ctx: Context) => {
    try {
      const profile = ProfileService.get()
      ctx.body = {
        success: true,
        data: profile,
      }
    } catch (error) {
      ctx.status = 404
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  update: async (ctx: Context) => {
    const data = ctx.request.body as {
      name?: string
      username?: string
      avatar?: string
      introduce?: string
      github?: string
      twitter?: string
      email?: string
    }

    try {
      const profile = ProfileService.update(data)
      ctx.body = {
        success: true,
        data: profile,
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },
}
