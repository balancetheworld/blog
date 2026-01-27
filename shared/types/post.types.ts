/**
 * 文章相关类型定义
 */

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  published: boolean
  categoryId?: string | null
  createdAt: number
  updatedAt: number
  views: number
  likes: number
}

export interface CreatePostInput {
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  published: boolean
  categoryId?: string
  tags?: string[]
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string
}

export type SortBy = 'latest' | 'popular'

export interface PostWithCategory extends Post {
  category?: {
    id: string
    name: string
    slug: string
  } | null
  tags?: Tag[]
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface ArchiveData {
  [year: string]: Post[]
}

export interface LikeResult {
  liked: boolean
  likes: number
}
