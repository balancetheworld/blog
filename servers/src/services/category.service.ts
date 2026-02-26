import { CategoryModel } from '../models/category.model'

export const CategoryService = {
  getAll: () => {
    return CategoryModel.findAll()
  },

  getById: (id: number) => {
    const category = CategoryModel.findById(id)
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  },

  getBySlug: (slug: string) => {
    const category = CategoryModel.findBySlug(slug)
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  },

  create: (slug: string, nameEn: string, nameZh: string, sortOrder?: number) => {
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
    })
  },

  update: (id: number, data: { slug?: string; name_en?: string; name_zh?: string; sort_order?: number }) => {
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

    CategoryModel.delete(id)
  },
}
