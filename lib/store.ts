/**
 * 兼容层 - 为前端服务端组件提供数据访问
 * 这是一个轻量级包装器，调用后端服务层
 */

import { postService } from '@/server/services/post.service'
import { categoryService } from '@/server/services/category.service'
import { commentService } from '@/server/services/comment.service'
import { authService } from '@/server/services/auth.service'

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

// Store 对象 - 提供与旧 API 兼容的接口
export const store = {
  // 文章相关
  getPostBySlug: async (slug: string) => {
    const post = await postService.getBySlug(slug)
    if (!post) return null
    return convertPost(post)
  },

  getPostById: async (id: string) => {
    const post = await postService.getById(id)
    if (!post) return null
    return convertPost(post)
  },

  getPostsByYear: async () => {
    const archive = await postService.getArchive()
    const result: Record<string, Post[]> = {}
    for (const [year, posts] of Object.entries(archive)) {
      result[year] = posts.map(convertPost)
    }
    return result
  },

  getAllPosts: async (sortBy: SortBy = 'latest', categoryId?: string) => {
    const { db, postTags, tags } = await import('@/server/db')

    const posts = await postService.getAll(sortBy, categoryId)

    // 添加分类和标签信息
    const postsWithExtra = await Promise.all(
      posts.map(async (post) => {
        const converted = convertPost(post)

        // 获取分类信息
        if (post.categoryId) {
          const category = await categoryService.getById(post.categoryId)
          if (category) {
            converted.category = convertCategory(category)
          }
        }

        // 获取标签
        const postTagRelations = await db.query.postTags.findMany({
          where: (postTags, { eq }) => eq(postTags.postId, post.id),
          with: {
            tag: true
          }
        })

        converted.tags = postTagRelations.map(pt => pt.tag.name)

        // 获取评论数量
        converted.commentsCount = await commentService.getCount(post.id)

        return converted
      })
    )

    return postsWithExtra
  },

  getAllPostsAdmin: async () => {
    const posts = await postService.getAllAdmin()
    return posts.map(convertPost)
  },

  // 分类相关
  getAllCategories: async () => {
    const categories = await categoryService.getAll()
    return categories.map(convertCategory)
  },

  getCategoryById: async (id: string) => {
    const category = await categoryService.getById(id)
    if (!category) return null
    return convertCategory(category)
  },

  getPostCountByCategory: async (categoryId: string) => {
    return await categoryService.getPostCount(categoryId)
  },

  // 评论相关
  getCommentsByPostId: async (postId: string) => {
    const comments = await commentService.getByPostId(postId)
    return comments.map(convertComment)
  },

  // 认证相关
  validateSession: async (token: string) => {
    return await authService.verifySession(token)
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
    likes: post.likes
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
