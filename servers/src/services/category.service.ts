import { CategoryModel, type Category } from '../models/category.model'

export const CategoryService = {
  getAll: (isAdmin = false) => {
    const all = CategoryModel.findAll()
    // 非管理员用户看不到私密分类
    if (!isAdmin) {
      return all.filter((cat: Category) => cat.is_private !== 1)
    }
    return all
  },

  getById: (id: number) => {
    const category = CategoryModel.findById(id)
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  },

  getBySlug: (slug: string, isAdmin = false) => {
    const category = CategoryModel.findBySlug(slug)
    if (!category) {
      throw new Error('Category not found')
    }
    // 非管理员用户无法访问私密分类
    if (!isAdmin && category.is_private === 1) {
      throw new Error('Category not found')
    }
    return category
  },

  create: (slug: string, nameEn: string, nameZh: string, sortOrder?: number, isPrivate?: number) => {
    // Check if slug already exists
    const existing = CategoryModel.findBySlug(slug)
    if (existing) {
      throw new Error('Category slug already exists')
    }

    return CategoryModel.create({
      slug,
      name_en: nameEn,
      name_zh: nameZh,
      sort_order: sortOrder ?? 0,
      is_private: isPrivate ?? 0,
    })
  },

  update: (id: number, data: { slug?: string; name_en?: string; name_zh?: string; sort_order?: number; is_private?: number }) => {
    const category = CategoryModel.findById(id)
    if (!category) {
      throw new Error('Category not found')
    }

    // Check if new slug already exists (if changing)
    if (data.slug && data.slug !== category.slug) {
      const existing = CategoryModel.findBySlug(data.slug)
      if (existing) {
        throw new Error('Category slug already exists')
      }
    }

    CategoryModel.update(id, data)
    return CategoryModel.findById(id)
  },

  delete: (id: number) => {
    const category = CategoryModel.findById(id)
    if (!category) {
      throw new Error('Category not found')
    }

    // 检查是否有文章使用该分类
    const hasArticles = CategoryModel.hasArticles(category.slug)
    if (hasArticles) {
      throw new Error('Cannot delete category: articles are still using it')
    }

    CategoryModel.delete(id)
  },
}
