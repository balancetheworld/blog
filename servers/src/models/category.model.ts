import { getDatabase } from '../database/connection'

export interface Category {
  id: number
  slug: string
  name_en: string
  name_zh: string
  sort_order: number
  created_at: string
}

export const CategoryModel = {
  findAll: (): Category[] => {
    const db = getDatabase()
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all() as Category[]
    return categories
  },

  findById: (id: number): Category | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined
    return result
  },

  findBySlug: (slug: string): Category | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as Category | undefined
    return result
  },

  create: (category: Omit<Category, 'id' | 'created_at'>): number => {
    const db = getDatabase()
    const now = new Date().toISOString()
    const info = db.prepare('INSERT INTO categories (slug, name_en, name_zh, sort_order, created_at) VALUES (?, ?, ?, ?, ?)').run(
      category.slug,
      category.name_en,
      category.name_zh,
      category.sort_order,
      now
    )
    return info.lastInsertRowid as number
  },

  update: (id: number, category: Partial<Omit<Category, 'id' | 'created_at'>>): void => {
    const db = getDatabase()
    const fields: string[] = []
    const values: unknown[] = []

    if (category.slug !== undefined) {
      fields.push('slug = ?')
      values.push(category.slug)
    }
    if (category.name_en !== undefined) {
      fields.push('name_en = ?')
      values.push(category.name_en)
    }
    if (category.name_zh !== undefined) {
      fields.push('name_zh = ?')
      values.push(category.name_zh)
    }
    if (category.sort_order !== undefined) {
      fields.push('sort_order = ?')
      values.push(category.sort_order)
    }

    values.push(id)
    db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  },

  delete: (id: number): void => {
    const db = getDatabase()
    db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  },
}
