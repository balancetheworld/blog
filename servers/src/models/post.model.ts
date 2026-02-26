import { getDatabase } from '../database/connection'

export interface Post {
  id: number
  slug: string
  category: string
  cover_image: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export interface PostTranslation {
  id: number
  post_id: number
  lang: string
  title: string
  summary: string
  content: string
}

export interface PostWithTranslations extends Post {
  translations: PostTranslation[]
  tags?: string[]
}

export const PostModel = {
  findAll: (params: { lang?: string; category?: string; sort?: string; q?: string } = {}): PostWithTranslations[] => {
    const db = getDatabase()
    let query = `
      SELECT p.*,
        GROUP_CONCAT(DISTINCT t.name) as tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE 1=1
    `
    const queryParams: unknown[] = []

    if (params.category) {
      query += ' AND p.category = ?'
      queryParams.push(params.category)
    }

    if (params.q) {
      query += ` AND EXISTS (
        SELECT 1 FROM post_translations pt WHERE pt.post_id = p.id
        AND (pt.title LIKE ? OR pt.content LIKE ?)
      )`
      const searchTerm = `%${params.q}%`
      queryParams.push(searchTerm, searchTerm)
    }

    query += ' GROUP BY p.id'

    if (params.sort === 'popular') {
      query += ' ORDER BY p.view_count DESC'
    } else {
      query += ' ORDER BY p.created_at DESC'
    }

    const posts = db.prepare(query).all(...queryParams) as (Post & { tags: string })[]

    // Get translations for each post
    const postsWithTranslations: PostWithTranslations[] = posts.map((post) => {
      let transQuery = 'SELECT * FROM post_translations WHERE post_id = ?'
      const transParams: unknown[] = [post.id]

      if (params.lang) {
        transQuery += ' AND lang = ?'
        transParams.push(params.lang)
      }

      const translations = db.prepare(transQuery).all(...transParams) as PostTranslation[]

      return {
        ...post,
        translations,
        tags: post.tags ? post.tags.split(',') : [],
        cover_image: post.cover_image,
      }
    })

    return postsWithTranslations
  },

  findBySlug: (slug: string): PostWithTranslations | undefined => {
    const db = getDatabase()
    const post = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as Post | undefined

    if (!post) return undefined

    const translations = db.prepare('SELECT * FROM post_translations WHERE post_id = ?').all(post.id) as PostTranslation[]
    const tagResult = db.prepare(`
      SELECT GROUP_CONCAT(t.name) as tags
      FROM post_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE pt.post_id = ?
    `).get(post.id) as { tags: string } | undefined

    return {
      ...post,
      translations,
      tags: tagResult?.tags ? tagResult.tags.split(',') : [],
    }
  },

  findById: (id: number): PostWithTranslations | undefined => {
    const db = getDatabase()
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Post | undefined

    if (!post) return undefined

    const translations = db.prepare('SELECT * FROM post_translations WHERE post_id = ?').all(post.id) as PostTranslation[]
    const tagResult = db.prepare(`
      SELECT GROUP_CONCAT(t.name) as tags
      FROM post_tags pt
      JOIN tags t ON pt.tag_id = t.id
      WHERE pt.post_id = ?
    `).get(post.id) as { tags: string } | undefined

    return {
      ...post,
      translations,
      tags: tagResult?.tags ? tagResult.tags.split(',') : [],
    }
  },

  create: (post: Omit<Post, 'id' | 'view_count' | 'created_at' | 'updated_at'>): number => {
    const db = getDatabase()
    const now = new Date().toISOString()
    const info = db.prepare(
      'INSERT INTO posts (slug, category, cover_image, view_count, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)'
    ).run(post.slug, post.category, post.cover_image, now, now)
    return info.lastInsertRowid as number
  },

  update: (id: number, post: Partial<Omit<Post, 'id' | 'created_at'>>): void => {
    const db = getDatabase()
    const now = new Date().toISOString()
    const fields: string[] = []
    const values: unknown[] = []

    if (post.slug !== undefined) {
      fields.push('slug = ?')
      values.push(post.slug)
    }
    if (post.category !== undefined) {
      fields.push('category = ?')
      values.push(post.category)
    }
    if (post.cover_image !== undefined) {
      fields.push('cover_image = ?')
      values.push(post.cover_image)
    }

    fields.push('updated_at = ?')
    values.push(now, id)

    db.prepare(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  },

  delete: (id: number): void => {
    const db = getDatabase()
    db.prepare('DELETE FROM posts WHERE id = ?').run(id)
  },

  incrementViewCount: (id: number): void => {
    const db = getDatabase()
    db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').run(id)
  },

  setTranslations: (postId: number, translations: Omit<PostTranslation, 'id' | 'post_id'>[]): void => {
    const db = getDatabase()
    const stmt = db.prepare('INSERT OR REPLACE INTO post_translations (post_id, lang, title, summary, content) VALUES (?, ?, ?, ?, ?)')

    for (const trans of translations) {
      stmt.run(postId, trans.lang, trans.title, trans.summary, trans.content)
    }
  },

  setTags: (postId: number, tagNames: string[]): void => {
    const db = getDatabase()

    // Delete existing tags
    db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(postId)

    // Add new tags
    for (const tagName of tagNames) {
      // Find or create tag
      let tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName) as { id: number } | undefined
      if (!tag) {
        const info = db.prepare('INSERT INTO tags (name) VALUES (?)').run(tagName)
        tag = { id: info.lastInsertRowid as number }
      }

      // Link tag to post
      db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').run(postId, tag.id)
    }
  },

  getLikeCount: (postId: number): number => {
    const db = getDatabase()
    const result = db.prepare('SELECT COUNT(*) as count FROM likes WHERE article_type = ? AND article_id = ?').get('post', postId) as { count: number }
    return result.count
  },
}
