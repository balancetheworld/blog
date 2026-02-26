import type { Context } from 'koa'
import { ArticleService } from '../services/article.service'

export const articleController = {
  getArticles: async (ctx: Context) => {
    const { lang, category, sort, q } = ctx.query as {
      lang?: string
      category?: string
      sort?: string
      q?: string
    }

    try {
      const articles = ArticleService.getArticles({ lang, category, sort, q })
      ctx.body = {
        success: true,
        data: articles,
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  getArticle: async (ctx: Context) => {
    const { slug } = ctx.params
    const { lang } = ctx.query as { lang?: string }

    try {
      const article = ArticleService.getArticleBySlug(slug)
      if (!article) {
        ctx.status = 404
        ctx.body = {
          success: false,
          error: 'Article not found',
        }
        return
      }

      // Increment view count
      ArticleService.incrementViewCount(article.id)

      ctx.body = {
        success: true,
        data: article,
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  createArticle: async (ctx: Context) => {
    const data = ctx.request.body

    try {
      const article = ArticleService.createArticle(data)
      ctx.body = {
        success: true,
        data: article,
      }
    } catch (error) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  updateArticle: async (ctx: Context) => {
    const { id } = ctx.params
    const data = ctx.request.body

    try {
      const article = ArticleService.updateArticle(Number(id), data)
      ctx.body = {
        success: true,
        data: article,
      }
    } catch (error) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  deleteArticle: async (ctx: Context) => {
    const { id } = ctx.params

    try {
      ArticleService.deleteArticle(Number(id))
      ctx.body = {
        success: true,
        message: 'Article deleted successfully',
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
