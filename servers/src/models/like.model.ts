import { getDatabase } from '../database/connection'

export interface Like {
  id: number
  article_type: 'post' | 'note'
  article_id: number
  user_id: number
  created_at: string
}

export const LikeModel = {
  findByUserAndArticle: (userId: number, articleType: 'post' | 'note', articleId: number): Like | undefined => {
    const db = getDatabase()
    const result = db.prepare(
      'SELECT * FROM likes WHERE user_id = ? AND article_type = ? AND article_id = ?'
    ).get(userId, articleType, articleId) as Like | undefined
    return result
  },

  toggle: (userId: number, articleType: 'post' | 'note', articleId: number): boolean => {
    const db = getDatabase()
    const existing = LikeModel.findByUserAndArticle(userId, articleType, articleId)

    if (existing) {
      // Remove like
      db.prepare('DELETE FROM likes WHERE user_id = ? AND article_type = ? AND article_id = ?').run(userId, articleType, articleId)
      return false
    } else {
      // Add like
      const now = new Date().toISOString()
      db.prepare('INSERT INTO likes (article_type, article_id, user_id, created_at) VALUES (?, ?, ?, ?)').run(articleType, articleId, userId, now)
      return true
    }
  },

  countByArticle: (articleType: 'post' | 'note', articleId: number): number => {
    const db = getDatabase()
    const result = db.prepare('SELECT COUNT(*) as count FROM likes WHERE article_type = ? AND article_id = ?').get(articleType, articleId) as { count: number }
    return result.count
  },

  deleteByArticle: (articleType: 'post' | 'note', articleId: number): void => {
    const db = getDatabase()
    db.prepare('DELETE FROM likes WHERE article_type = ? AND article_id = ?').run(articleType, articleId)
  },
}
