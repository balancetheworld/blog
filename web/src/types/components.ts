// 组件 Props 类型定义

import { type LucideIcon } from 'lucide-react'
import { type Editor } from '@tiptap/react'

// ============================================================================
// 基础组件 Props
// ============================================================================

/** SectionHeader 组件 Props */
export interface SectionHeaderProps {
  title: string
  icon: LucideIcon
  linkText?: string
  linkHref?: string
}

/** MarkdownRenderer 组件 Props */
export interface MarkdownRendererProps {
  content: string
}

/** HtmlRenderer 组件 Props */
export interface HtmlRendererProps {
  content: string
  className?: string
}

/** ImageLightbox 组件 Props */
export interface ImageLightboxProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

/** LikeButton 组件 Props */
export interface LikeButtonProps {
  articleType: 'post' | 'note'
  articleId: number
}

/** CommentSection 组件 Props */
export interface CommentSectionProps {
  articleType: 'post' | 'note'
  articleId: number
}

// ============================================================================
// 文章/笔记相关类型
// ============================================================================

/** 文章翻译（PostDetail 组件使用） */
export interface PostTranslation {
  id: number
  post_id: number
  lang: string
  title: string
  summary: string
  content: string
}

/** 文章详情数据（PostDetail 组件使用） */
export interface PostData {
  id: number
  slug: string
  cover_image: string | null
  view_count: number
  like_count: number
  tags?: string[]
  created_at: string
  updated_at: string
  translations: PostTranslation[]
}

/** 笔记翻译（NoteDetailPage 组件使用） */
export interface NoteTranslation {
  lang: string
  title: string
  content: string
}

/** 笔记详情数据（NoteDetailPage 组件使用） */
export interface NoteData {
  id: number
  nid: number
  view_count: number
  like_count: number
  created_at: string
  translations: NoteTranslation[]
}

// ============================================================================
// 评论/动态相关类型
// ============================================================================

/** 评论数据（CommentSection 组件使用） */
export interface Comment {
  id: number
  content: string
  created_at: string
  user_id: number
  username: string
  display_name: string
}

/** 动态图片（RecentlySection 组件使用） */
export interface RecentlyImage {
  id: number
  recently_id: number
  image_url: string
  sort_order: number
}

/** 动态项（RecentlySection 组件使用） */
export interface RecentlyItem {
  id: number
  content: string
  image_url?: string | null
  created_at: string
  images?: RecentlyImage[]
}

// ============================================================================
// 分类管理类型
// ============================================================================

/** 分类数据（CategoriesPage 组件使用，与 types/index.ts 中的 Category 保持一致） */
export interface CategoryAdmin {
  id: number
  slug: string
  name_en: string
  name_zh: string
  sort_order: number
}
