import type { Context } from 'koa'
import { NoteService } from '../services/note.service'

export const noteController = {
  getNotes: async (ctx: Context) => {
    try {
      const notes = NoteService.getNotes()
      ctx.body = {
        success: true,
        data: notes,
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  getNote: async (ctx: Context) => {
    const { nid } = ctx.params

    try {
      const note = NoteService.getNoteByNid(Number(nid))
      if (!note) {
        ctx.status = 404
        ctx.body = {
          success: false,
          error: 'Note not found',
        }
        return
      }

      // Increment view count
      NoteService.incrementViewCount(Number(nid))

      ctx.body = {
        success: true,
        data: note,
      }
    } catch (error) {
      ctx.status = 500
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  createNote: async (ctx: Context) => {
    const data = ctx.request.body

    try {
      const note = NoteService.createNote(data)
      ctx.body = {
        success: true,
        data: note,
      }
    } catch (error) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  updateNote: async (ctx: Context) => {
    const { id } = ctx.params
    const data = ctx.request.body

    try {
      const note = NoteService.updateNote(Number(id), data)
      ctx.body = {
        success: true,
        data: note,
      }
    } catch (error) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },

  deleteNote: async (ctx: Context) => {
    const { id } = ctx.params

    try {
      NoteService.deleteNote(Number(id))
      ctx.body = {
        success: true,
        message: 'Note deleted successfully',
      }
    } catch (error) {
      ctx.status = 404
      ctx.body = {
        success: false,
        error: (error as Error).message,
      }
    }
  },
}
