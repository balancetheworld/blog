import type { Context } from 'koa'
import { LikeService } from '../services/like.service'

export const likeController = {
  // 获取点赞数（公开接口，不需要认证）
  getLikeCount: async (ctx: Context) => {
    // 支持查询参数和路径参数两种格式
    const articleType = (ctx.query.type as string) || ctx.params.articleType
    const articleId = (ctx.query.articleId as string) || ctx.params.articleId
    const user = ctx.state.user as { id: number } | undefined

    if (articleType !== 'post' && articleType !== 'note') {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: 'Invalid article type',
      }
      return
    }

    try {
      const count = LikeService.getLikeCount(articleType as 'post' | 'note', Number(articleId))
      // 如果用户已登录，返回真实的点赞状态
      let liked = false
      if (user) {
        const status = LikeService.getLikeStatus(user.id, articleType as 'post' | 'note', Number(articleId))
        liked = status.liked
      }
      ctx.body = {
        success: true,
        data: { count, liked },
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  toggleLike: async (ctx: Context) => {
    const user = ctx.state.user as { id: number }
    const { article_type, article_id } = ctx.request.body as {
      article_type: 'post' | 'note'
      article_id: number
    }

    if (!article_type || !article_id) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: 'Missing required fields',
      }
      return
    }

    if (article_type !== 'post' && article_type !== 'note') {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: 'Invalid article type',
      }
      return
    }

    try {
      const result = LikeService.toggleLike(user.id, article_type, article_id)
      ctx.body = {
        success: true,
        data: result,
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  getLikeStatus: async (ctx: Context) => {
    const user = ctx.state.user as { id: number }
    // 支持查询参数和路径参数两种格式
    const articleType = (ctx.query.type as string) || ctx.params.articleType
    const articleId = (ctx.query.articleId as string) || ctx.params.articleId

    if (articleType !== 'post' && articleType !== 'note') {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: 'Invalid article type',
      }
      return
    }

    try {
      const result = LikeService.getLikeStatus(user.id, articleType as 'post' | 'note', Number(articleId))
      ctx.body = {
        success: true,
        data: result,
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
