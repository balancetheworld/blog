import { PostModel } from '../models/post.model'
import { LikeModel } from '../models/like.model'

export const ArticleService = {
  getArticles: (params: { lang?: string; category?: string; sort?: string; q?: string; isAdmin?: boolean } = {}) => {
    const posts = PostModel.findAll(params)

    // Add like counts
    return posts.map((post) => ({
      ...post,
      like_count: LikeModel.countByArticle('post', post.id),
    }))
  },

  getArticleBySlug: (slug: string) => {
    const post = PostModel.findBySlug(slug)
    if (!post) return null

    return {
      ...post,
      like_count: LikeModel.countByArticle('post', post.id),
    }
  },

  getArticleById: (id: number) => {
    const post = PostModel.findById(id)
    if (!post) return null

    return {
      ...post,
      like_count: LikeModel.countByArticle('post', post.id),
    }
  },

  createArticle: (data: {
    slug: string
    category: string
    title_en: string
    title_zh: string
    summary_en: string
    summary_zh: string
    content_en: string
    content_zh: string
    tags?: string[]
    cover_image?: string
  }) => {
    // Check if slug already exists
    const existing = PostModel.findBySlug(data.slug)
    if (existing) {
      throw new Error('Article slug already exists')
    }

    // Create post
    const postId = PostModel.create({
      slug: data.slug,
      category: data.category,
      cover_image: data.cover_image || null,
      is_pinned: 0,
    })

    // Create translations
    PostModel.setTranslations(postId, [
      { lang: 'en', title: data.title_en, summary: data.summary_en, content: data.content_en },
      { lang: 'zh', title: data.title_zh, summary: data.summary_zh, content: data.content_zh },
    ])

    // Set tags
    if (data.tags && data.tags.length > 0) {
      PostModel.setTags(postId, data.tags)
    }

    return ArticleService.getArticleById(postId)
  },

  updateArticle: (
    id: number,
    data: {
      slug?: string
      category?: string
      title_en?: string
      title_zh?: string
      summary_en?: string
      summary_zh?: string
      content_en?: string
      content_zh?: string
      tags?: string[]
      cover_image?: string
    }
  ) => {
    const post = PostModel.findById(id)
    if (!post) {
      throw new Error('Article not found')
    }

    // Check if new slug already exists (if changing)
    if (data.slug && data.slug !== post.slug) {
      const existing = PostModel.findBySlug(data.slug)
      if (existing) {
        throw new Error('Article slug already exists')
      }
    }

    // Update post
    PostModel.update(id, {
      slug: data.slug,
      category: data.category,
      cover_image: data.cover_image,
    })

    // Update translations if provided
    const translations: { lang: string; title: string; summary: string; content: string }[] = []
    if (data.title_en || data.summary_en || data.content_en) {
      translations.push({
        lang: 'en',
        title: data.title_en ?? '',
        summary: data.summary_en ?? '',
        content: data.content_en ?? '',
      })
    }
    if (data.title_zh || data.summary_zh || data.content_zh) {
      translations.push({
        lang: 'zh',
        title: data.title_zh ?? '',
        summary: data.summary_zh ?? '',
        content: data.content_zh ?? '',
      })
    }
    if (translations.length > 0) {
      PostModel.setTranslations(id, translations)
    }

    // Update tags if provided
    if (data.tags) {
      PostModel.setTags(id, data.tags)
    }

    return ArticleService.getArticleById(id)
  },

  deleteArticle: (id: number) => {
    const post = PostModel.findById(id)
    if (!post) {
      throw new Error('Article not found')
    }

    PostModel.delete(id)
  },

  incrementViewCount: (id: number) => {
    PostModel.incrementViewCount(id)
  },

  togglePinArticle: (id: number) => {
    const post = PostModel.findById(id)
    if (!post) {
      throw new Error('Article not found')
    }

    return PostModel.togglePin(id)
  },
}
