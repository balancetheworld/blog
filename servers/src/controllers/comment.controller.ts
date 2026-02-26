import type { Context } from 'koa'
import { CommentService } from '../services/comment.service'

export const commentController = {
  getComments: async (ctx: Context) => {
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
      const comments = CommentService.getCommentsByArticle(articleType as 'post' | 'note', Number(articleId))
      ctx.body = {
        success: true,
        data: comments,
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  createComment: async (ctx: Context) => {
    const user = ctx.state.user as { id: number }
    const { article_type, article_id, content } = ctx.request.body as {
      article_type: 'post' | 'note'
      article_id: number
      content: string
    }

    if (!article_type || !article_id || !content) {
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
      const commentId = CommentService.createComment(user.id, article_type, article_id, content)
      ctx.body = {
        success: true,
        data: { id: commentId },
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  deleteComment: async (ctx: Context) => {
    const user = ctx.state.user as { id: number }
    const { id } = ctx.params

    try {
      CommentService.deleteComment(Number(id), user.id)
      ctx.body = {
        success: true,
        message: 'Comment deleted successfully',
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      ctx.status = errorMessage.includes('Forbidden') ? 403 : 404
      ctx.body = {
        success: false,
        error: errorMessage,
      }
    }
  },
}
