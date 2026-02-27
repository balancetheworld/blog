import { getDatabase } from '../database/connection'

export interface Recently {
  id: number
  content: string
  image_url: string | null
  created_at: string
  images?: RecentlyImage[]
}

export interface RecentlyImage {
  id: number
  recently_id: number
  image_url: string
  sort_order: number
}

export const RecentlyModel = {
  findAll: (): Recently[] => {
    const db = getDatabase()
    const recently = db.prepare('SELECT * FROM recently ORDER BY created_at DESC').all() as Recently[]

    // Get images for each entry
    for (const item of recently) {
      item.images = db
        .prepare('SELECT * FROM recently_images WHERE recently_id = ? ORDER BY sort_order ASC')
        .all(item.id) as RecentlyImage[]
    }

    return recently
  },

  findById: (id: number): Recently | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM recently WHERE id = ?').get(id) as Recently | undefined
    if (result) {
      result.images = db
        .prepare('SELECT * FROM recently_images WHERE recently_id = ? ORDER BY sort_order ASC')
        .all(id) as RecentlyImage[]
    }
    return result
  },

  create: (item: Omit<Recently, 'id' | 'created_at'>, images?: string[]): number => {
    const db = getDatabase()
    const now = new Date().toISOString()

    // Insert recently entry
    const info = db
      .prepare('INSERT INTO recently (content, image_url, created_at) VALUES (?, ?, ?)')
      .run(item.content, item.image_url || null, now)
    const recentlyId = info.lastInsertRowid as number

    // Insert images if provided
    if (images && images.length > 0) {
      const insertImage = db.prepare(
        'INSERT INTO recently_images (recently_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?)'
      )
      images.forEach((url, index) => {
        insertImage.run(recentlyId, url, index, now)
      })
    }

    return recentlyId
  },

  update: (id: number, item: Partial<Omit<Recently, 'id' | 'created_at'>>, images?: string[]): void => {
    const db = getDatabase()
    const fields: string[] = []
    const values: unknown[] = []

    if (item.content !== undefined) {
      fields.push('content = ?')
      values.push(item.content)
    }
    if (item.image_url !== undefined) {
      fields.push('image_url = ?')
      values.push(item.image_url)
    }

    if (fields.length > 0) {
      values.push(id)
      db.prepare(`UPDATE recently SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    }

    // Handle images update
    if (images !== undefined) {
      // Delete existing images
      db.prepare('DELETE FROM recently_images WHERE recently_id = ?').run(id)

      // Insert new images
      if (images.length > 0) {
        const now = new Date().toISOString()
        const insertImage = db.prepare(
          'INSERT INTO recently_images (recently_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?)'
        )
        images.forEach((url, index) => {
          insertImage.run(id, url, index, now)
        })
      }
    }
  },

  delete: (id: number): void => {
    const db = getDatabase()
    // Images will be cascade deleted
    db.prepare('DELETE FROM recently WHERE id = ?').run(id)
  },
}
