/**
 * 分类相关类型定义
 */

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: number
}

export interface CreateCategoryInput {
  name: string
  slug: string
  description?: string
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string
}

export interface CategoryWithPostCount extends Category {
  postCount: number
}
