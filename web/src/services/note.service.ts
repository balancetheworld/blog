import api from './api'
import type { ApiResponse, NoteWithTranslations, CreateNoteRequest, UpdateNoteRequest } from '../types'

export const noteService = {
  getNotes: (): Promise<ApiResponse<NoteWithTranslations[]>> => {
    return api.get('/api/notes')
  },

  getNote: (nid: number): Promise<ApiResponse<NoteWithTranslations>> => {
    return api.get(`/api/notes/${nid}`)
  },

  createNote: (data: CreateNoteRequest): Promise<ApiResponse<NoteWithTranslations>> => {
    return api.post('/api/admin/notes', data)
  },

  updateNote: (id: number, data: UpdateNoteRequest): Promise<ApiResponse<NoteWithTranslations>> => {
    return api.put(`/api/admin/notes/${id}`, data)
  },

  deleteNote: (id: number): Promise<ApiResponse> => {
    return api.delete(`/api/admin/notes/${id}`)
  },
}
