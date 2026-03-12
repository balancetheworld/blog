// 通用 API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 用户类型
export interface User {
  id: number
  username: string
  displayName: string
  role: 'admin' | 'user'
}

export interface UserSession extends User {
  token?: string
}

// 文章类型
export interface Post {
  id: number
  slug: string
  category: string
  cover_image: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export interface PostTranslation {
  post_id: number
  lang: 'en' | 'zh'
  title: string
  summary: string
  content: string
}

export interface PostWithTranslations extends Post {
  translations: PostTranslation[]
  tags?: string[]
  like_count?: number
}

// 笔记类型
export interface Note {
  id: number
  nid: number
  view_count: number
  created_at: string
}

export interface NoteTranslation {
  note_id: number
  lang: 'en' | 'zh'
  title: string
  content: string
}

export interface NoteWithTranslations extends Note {
  translations: NoteTranslation[]
  like_count?: number
}

// 评论类型
export interface Comment {
  id: number
  article_type: 'post' | 'note'
  article_id: number
  user_id: number
  content: string
  created_at: string
}

export interface CommentWithUser extends Comment {
  username: string
  display_name: string
}

// 分类类型
export interface Category {
  id: number
  slug: string
  name_en: string
  name_zh: string
  sort_order: number
  created_at: string
}

// 动态类型
export interface Recently {
  id: number
  content: string
  image_url: string | null
  created_at: string
}

// 个人资料类型
export interface Profile {
  id: number
  name: string
  username: string
  avatar: string | null
  introduce: string
  github: string | null
  twitter: string | null
  email: string | null
}

// 国际化标签类型
export interface I18nLabel {
  id: number
  lang: string
  key: string
  value: string
}

// 查询参数类型
export interface ArticleQuery {
  lang?: string
  category?: string
  sort?: 'latest' | 'popular'
  q?: string
}

// 认证相关类型
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  displayName: string
}

// 点赞类型
export interface LikeRequest {
  article_type: 'post' | 'note'
  article_id: number
}

// 创建/更新文章类型
export interface CreateArticleRequest {
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
}

export interface UpdateArticleRequest {
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

// 创建/更新笔记类型
export interface CreateNoteRequest {
  nid: number
  title_en: string
  title_zh: string
  content_en: string
  content_zh: string
}

export interface UpdateNoteRequest {
  nid?: number
  title_en?: string
  title_zh?: string
  content_en?: string
  content_zh?: string
}

// 创建/更新动态类型
export interface CreateRecentlyRequest {
  content: string
  image_url?: string
}

export interface UpdateRecentlyRequest {
  content?: string
  image_url?: string
}

// 创建/更新分类类型
export interface CreateCategoryRequest {
  slug: string
  name_en: string
  name_zh: string
  sort_order?: number
}

export interface UpdateCategoryRequest {
  slug?: string
  name_en?: string
  name_zh?: string
  sort_order?: number
}

// 创建评论类型
export interface CreateCommentRequest {
  article_type: 'post' | 'note'
  article_id: number
  content: string
}

// ============================================================================
// 统一导出所有类型模块
// ============================================================================

export * from './components'
export * from './contexts'
export * from './editor'
export * from './ui'
