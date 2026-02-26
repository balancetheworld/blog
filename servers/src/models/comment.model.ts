import { getDatabase } from '../database/connection'

export interface Comment {
  id: number
  article_type: 'post' | 'note'
  article_id: number
  user_id: number
  content: string
  created_at: string
}

export interface CommentWithUser extends Comment {
  username: string
  display_name: string
}

export const CommentModel = {
  findByArticle: (articleType: 'post' | 'note', articleId: number): CommentWithUser[] => {
    const db = getDatabase()
    const comments = db.prepare(
      `SELECT c.*, u.username, u.display_name
       FROM comments c
       JOIN admin_users u ON c.user_id = u.id
       WHERE c.article_type = ? AND c.article_id = ?
       ORDER BY c.created_at ASC`
    ).all(articleType, articleId) as CommentWithUser[]
    return comments
  },

  findById: (id: number): CommentWithUser | undefined => {
    const db = getDatabase()
    const comment = db.prepare(
      `SELECT c.*, u.username, u.display_name
       FROM comments c
       JOIN admin_users u ON c.user_id = u.id
       WHERE c.id = ?`
    ).get(id) as CommentWithUser | undefined
    return comment
  },

  create: (comment: Omit<Comment, 'id' | 'created_at'>): number => {
    const db = getDatabase()
    const now = new Date().toISOString()
    const info = db.prepare(
      'INSERT INTO comments (article_type, article_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(comment.article_type, comment.article_id, comment.user_id, comment.content, now)
    return info.lastInsertRowid as number
  },

  delete: (id: number): void => {
    const db = getDatabase()
    db.prepare('DELETE FROM comments WHERE id = ?').run(id)
  },

  deleteByArticle: (articleType: 'post' | 'note', articleId: number): void => {
    const db = getDatabase()
    db.prepare('DELETE FROM comments WHERE article_type = ? AND article_id = ?').run(articleType, articleId)
  },
}
