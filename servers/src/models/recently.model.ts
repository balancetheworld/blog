import { getDatabase } from '../database/connection'

export interface Recently {
  id: number
  content: string
  image_url: string | null
  created_at: string
}

export const RecentlyModel = {
  findAll: (): Recently[] => {
    const db = getDatabase()
    const recently = db.prepare('SELECT * FROM recently ORDER BY created_at DESC').all() as Recently[]
    return recently
  },

  findById: (id: number): Recently | undefined => {
    const db = getDatabase()
    const result = db.prepare('SELECT * FROM recently WHERE id = ?').get(id) as Recently | undefined
    return result
  },

  create: (item: Omit<Recently, 'id' | 'created_at'>): number => {
    const db = getDatabase()
    const now = new Date().toISOString()
    const info = db.prepare('INSERT INTO recently (content, image_url, created_at) VALUES (?, ?, ?)').run(item.content, item.image_url, now)
    return info.lastInsertRowid as number
  },

  update: (id: number, item: Partial<Omit<Recently, 'id' | 'created_at'>>): void => {
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

    values.push(id)
    db.prepare(`UPDATE recently SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  },

  delete: (id: number): void => {
    const db = getDatabase()
    db.prepare('DELETE FROM recently WHERE id = ?').run(id)
  },
}
