import { RecentlyModel } from '../models/recently.model'

export const RecentlyService = {
  getAll: () => {
    return RecentlyModel.findAll()
  },

  getById: (id: number) => {
    const item = RecentlyModel.findById(id)
    if (!item) {
      throw new Error('Thought not found')
    }
    return item
  },

  create: (content: string, imageUrl?: string) => {
    return RecentlyModel.create({
      content,
      image_url: imageUrl || null,
    })
  },

  update: (id: number, data: { content?: string; image_url?: string }) => {
    const item = RecentlyModel.findById(id)
    if (!item) {
      throw new Error('Thought not found')
    }

    RecentlyModel.update(id, data)
    return RecentlyModel.findById(id)
  },

  delete: (id: number) => {
    const item = RecentlyModel.findById(id)
    if (!item) {
      throw new Error('Thought not found')
    }

    RecentlyModel.delete(id)
  },
}
