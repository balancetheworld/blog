import { getDatabase } from '../database/connection'

export interface Note {
  id: number
  nid: number
  view_count: number
  created_at: string
}

export interface NoteTranslation {
  id: number
  note_id: number
  lang: string
  title: string
  content: string
}

export interface NoteWithTranslations extends Note {
  translations: NoteTranslation[]
}

export const NoteModel = {
  findAll: (): NoteWithTranslations[] => {
    const db = getDatabase()
    const notes = db.prepare('SELECT * FROM notes ORDER BY created_at DESC').all() as Note[]

    return notes.map((note) => {
      const translations = db.prepare('SELECT * FROM note_translations WHERE note_id = ?').all(note.id) as NoteTranslation[]
      return {
        ...note,
        translations,
      }
    })
  },

  findByNid: (nid: number): NoteWithTranslations | undefined => {
    const db = getDatabase()
    const note = db.prepare('SELECT * FROM notes WHERE nid = ?').get(nid) as Note | undefined

    if (!note) return undefined

    const translations = db.prepare('SELECT * FROM note_translations WHERE note_id = ?').all(note.id) as NoteTranslation[]

    return {
      ...note,
      translations,
    }
  },

  findById: (id: number): NoteWithTranslations | undefined => {
    const db = getDatabase()
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note | undefined

    if (!note) return undefined

    const translations = db.prepare('SELECT * FROM note_translations WHERE note_id = ?').all(note.id) as NoteTranslation[]

    return {
      ...note,
      translations,
    }
  },

  create: (note: Omit<Note, 'id' | 'view_count' | 'created_at'>): number => {
    const db = getDatabase()
    const now = new Date().toISOString()
    const info = db.prepare('INSERT INTO notes (nid, view_count, created_at) VALUES (?, 0, ?)').run(note.nid, now)
    return info.lastInsertRowid as number
  },

  update: (id: number, note: Partial<Omit<Note, 'id' | 'created_at'>>): void => {
    const db = getDatabase()
    const fields: string[] = []
    const values: unknown[] = []

    if (note.nid !== undefined) {
      fields.push('nid = ?')
      values.push(note.nid)
    }

    values.push(id)
    db.prepare(`UPDATE notes SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  },

  delete: (id: number): void => {
    const db = getDatabase()
    db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  },

  incrementViewCount: (id: number): void => {
    const db = getDatabase()
    db.prepare('UPDATE notes SET view_count = view_count + 1 WHERE id = ?').run(id)
  },

  setTranslations: (noteId: number, translations: Omit<NoteTranslation, 'id' | 'note_id'>[]): void => {
    const db = getDatabase()
    const stmt = db.prepare('INSERT OR REPLACE INTO note_translations (note_id, lang, title, content) VALUES (?, ?, ?, ?)')

    for (const trans of translations) {
      stmt.run(noteId, trans.lang, trans.title, trans.content)
    }
  },

  getLikeCount: (noteId: number): number => {
    const db = getDatabase()
    const result = db.prepare('SELECT COUNT(*) as count FROM likes WHERE article_type = ? AND article_id = ?').get('note', noteId) as { count: number }
    return result.count
  },
}
