/**
 * 数据访问层 - 通过 API 调用后端服务
 */

import { api } from './api'

// 导出类型
export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  published: boolean
  createdAt: number
  updatedAt: number
  tags?: string[]
  categoryId?: string
  category?: Category
  views: number
  likes: number
  commentsCount?: number
}

export interface Comment {
  id: string
  postId: string
  author: string
  content: string
  createdAt: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: number
}

export type SortBy = 'latest' | 'popular'

// Store 对象 - 提供 API 接口
export const store = {
  // 文章相关
  getPostBySlug: async (slug: string) => {
    try {
      const post = await api.get<any>(`/api/posts/${slug}`)
      return convertPost(post)
    } catch (error) {
      console.error('Error fetching post by slug:', error)
      return null
    }
  },

  getPostById: async (id: string) => {
    try {
      const post = await api.get<any>(`/api/posts/by-id/${id}`)
      return convertPost(post)
    } catch (error) {
      console.error('Error fetching post by id:', error)
      return null
    }
  },

  getPostsByYear: async () => {
    try {
      const posts = await api.get<any[]>('/api/posts')
      const grouped: Record<string, Post[]> = {}

      posts.forEach(post => {
        const converted = convertPost(post)
        const year = new Date(converted.createdAt).getFullYear().toString()
        if (!grouped[year]) {
          grouped[year] = []
        }
        grouped[year].push(converted)
      })

      return grouped
    } catch (error) {
      console.error('Error fetching archive:', error)
      return {}
    }
  },

  getAllPosts: async (sortBy: SortBy = 'latest', categoryId?: string) => {
    try {
      const params = new URLSearchParams({
        sortBy,
        ...(categoryId && { categoryId })
      })

      console.log('[Store] Fetching posts with params:', params.toString())
      const posts = await api.get<any[]>(`/api/posts?${params}`)
      console.log('[Store] Received posts:', posts.length, 'posts')
      return posts.map(convertPost)
    } catch (error) {
      console.error('[Store] Error fetching posts:', error)
      return []
    }
  },

  getAllPostsAdmin: async () => {
    try {
      const posts = await api.get<any[]>('/api/posts/admin')
      return posts.map(convertPost)
    } catch (error) {
      console.error('Error fetching admin posts:', error)
      return []
    }
  },

  // 分类相关
  getAllCategories: async () => {
    try {
      const categories = await api.get<any[]>('/api/categories')
      return categories.map(convertCategory)
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  },

  getCategoryById: async (id: string) => {
    try {
      const category = await api.get<any>(`/api/categories/${id}`)
      return convertCategory(category)
    } catch (error) {
      console.error('Error fetching category:', error)
      return null
    }
  },

  getPostCountByCategory: async (categoryId: string) => {
    try {
      const result = await api.get<{ count: number }>(`/api/categories/${categoryId}/post-count`)
      return result.count
    } catch (error) {
      console.error('Error fetching post count:', error)
      return 0
    }
  },

  // 评论相关
  getCommentsByPostId: async (postId: string) => {
    try {
      const comments = await api.get<any[]>(`/api/comments/post/${postId}`)
      return comments.map(convertComment)
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  },

  // 认证相关
  validateSession: async (token: string) => {
    try {
      const user = await api.get<any>('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return user
    } catch (error) {
      console.error('Error validating session:', error)
      return null
    }
  }
}

// 辅助函数 - 转换数据库类型到前端类型
function convertPost(post: any): Post {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage || undefined,
    published: Boolean(post.published),
    createdAt: post.createdAt instanceof Date ? post.createdAt.getTime() : post.createdAt,
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt.getTime() : post.updatedAt,
    categoryId: post.categoryId || undefined,
    views: post.views,
    likes: post.likes,
    tags: post.tags,
    category: post.category ? convertCategory(post.category) : undefined,
    commentsCount: post.commentsCount
  }
}

function convertCategory(category: any): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || undefined,
    createdAt: category.createdAt instanceof Date ? category.createdAt.getTime() : category.createdAt
  }
}

function convertComment(comment: any): Comment {
  return {
    id: comment.id,
    postId: comment.postId,
    author: comment.author,
    content: comment.content,
    createdAt: comment.createdAt instanceof Date ? comment.createdAt.getTime() : comment.createdAt
  }
}
