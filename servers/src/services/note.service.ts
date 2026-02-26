import { NoteModel } from '../models/note.model'
import { LikeModel } from '../models/like.model'

export const NoteService = {
  getNotes: () => {
    const notes = NoteModel.findAll()

    // Add like counts
    return notes.map((note) => ({
      ...note,
      like_count: LikeModel.countByArticle('note', note.id),
    }))
  },

  getNoteByNid: (nid: number) => {
    const note = NoteModel.findByNid(nid)
    if (!note) return null

    return {
      ...note,
      like_count: LikeModel.countByArticle('note', note.id),
    }
  },

  getNoteById: (id: number) => {
    const note = NoteModel.findById(id)
    if (!note) return null

    return {
      ...note,
      like_count: LikeModel.countByArticle('note', note.id),
    }
  },

  createNote: (data: {
    nid: number
    title_en: string
    title_zh: string
    content_en: string
    content_zh: string
  }) => {
    // Check if nid already exists
    const existing = NoteModel.findByNid(data.nid)
    if (existing) {
      throw new Error('Note NID already exists')
    }

    // Create note
    const noteId = NoteModel.create({
      nid: data.nid,
    })

    // Create translations
    NoteModel.setTranslations(noteId, [
      { lang: 'en', title: data.title_en, content: data.content_en },
      { lang: 'zh', title: data.title_zh, content: data.content_zh },
    ])

    return NoteService.getNoteById(noteId)
  },

  updateNote: (
    id: number,
    data: {
      nid?: number
      title_en?: string
      title_zh?: string
      content_en?: string
      content_zh?: string
    }
  ) => {
    const note = NoteModel.findById(id)
    if (!note) {
      throw new Error('Note not found')
    }

    // Check if new nid already exists (if changing)
    if (data.nid && data.nid !== note.nid) {
      const existing = NoteModel.findByNid(data.nid)
      if (existing) {
        throw new Error('Note NID already exists')
      }
    }

    // Update note
    if (data.nid) {
      NoteModel.update(id, { nid: data.nid })
    }

    // Update translations if provided
    const translations: { lang: string; title: string; content: string }[] = []
    if (data.title_en || data.content_en) {
      translations.push({
        lang: 'en',
        title: data.title_en ?? '',
        content: data.content_en ?? '',
      })
    }
    if (data.title_zh || data.content_zh) {
      translations.push({
        lang: 'zh',
        title: data.title_zh ?? '',
        content: data.content_zh ?? '',
      })
    }
    if (translations.length > 0) {
      NoteModel.setTranslations(id, translations)
    }

    return NoteService.getNoteById(id)
  },

  deleteNote: (id: number) => {
    const note = NoteModel.findById(id)
    if (!note) {
      throw new Error('Note not found')
    }

    NoteModel.delete(id)
  },

  incrementViewCount: (nid: number) => {
    const note = NoteModel.findByNid(nid)
    if (note) {
      NoteModel.incrementViewCount(note.id)
    }
  },
}
