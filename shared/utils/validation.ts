import { z } from 'zod'

/**
 * 用户认证验证
 */
export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码至少6位')
})

export const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3位').max(20, '用户名最多20位'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(1, '姓名不能为空')
})

/**
 * 文章验证
 */
export const postSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多200字'),
  slug: z.string().min(1, 'slug不能为空').regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符'),
  content: z.string().min(1, '内容不能为空'),
  excerpt: z.string().min(1, '摘要不能为空').max(500, '摘要最多500字'),
  coverImage: z.string().url('封面图必须是有效的URL').optional().or(z.literal('')),
  published: z.boolean(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional()
})

export const updatePostSchema = postSchema.partial().extend({
  id: z.string().min(1, 'ID不能为空')
})

/**
 * 分类验证
 */
export const categorySchema = z.object({
  name: z.string().min(1, '名称不能为空').max(50, '名称最多50字'),
  slug: z.string().min(1, 'slug不能为空').regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符'),
  description: z.string().max(200, '描述最多200字').optional()
})

export const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().min(1, 'ID不能为空')
})

/**
 * 评论验证
 */
export const commentSchema = z.object({
  postId: z.string().min(1, '文章ID不能为空'),
  author: z.string().min(1, '作者不能为空').max(50, '作者名最多50字'),
  content: z.string().min(1, '内容不能为空').max(1000, '评论最多1000字')
})

/**
 * 导出类型推断
 */
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PostInput = z.infer<typeof postSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CommentInput = z.infer<typeof commentSchema>
