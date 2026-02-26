import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) return db

  const dbDir = path.join(__dirname, '../../database')
  const dbPath = path.join(dbDir, 'blog.db')

  // 确保目录存在
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // 初始化表结构
  initTables(db)

  return db
}

function initTables(database: Database.Database): void {
  // 创建所有表 (与现有表结构一致)
  database.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      category TEXT DEFAULT 'default',
      cover_image TEXT,
      view_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT DEFAULT '',
      content TEXT DEFAULT '',
      FOREIGN KEY (post_id) REFERENCES posts(id),
      UNIQUE(post_id, lang)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nid INTEGER UNIQUE NOT NULL,
      view_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS note_translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      FOREIGN KEY (note_id) REFERENCES notes(id),
      UNIQUE(note_id, lang)
    );

    CREATE TABLE IF NOT EXISTS recently (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      avatar TEXT,
      introduce TEXT DEFAULT '',
      github TEXT,
      twitter TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES admin_users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_type TEXT NOT NULL,
      article_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES admin_users(id)
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_type TEXT NOT NULL,
      article_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(article_type, article_id, user_id),
      FOREIGN KEY (user_id) REFERENCES admin_users(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_zh TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (post_id, tag_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `)

  // 初始化种子数据
  seedData(database)
}

function seedData(database: Database.Database): void {
  // 检查是否已有数据（使用 profile 表检查）
  const countResult = database.prepare('SELECT COUNT(*) as count FROM profile').get() as { count: number }
  if (countResult.count > 0) {
    return // 已有数据，跳过
  }

  // Default admin user (password: admin123)
  // SHA-256 of "admin123"
  const adminPasswordHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
  database.prepare(
    `INSERT INTO admin_users (username, password_hash, display_name, role, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run('admin', adminPasswordHash, 'Admin', 'admin', new Date().toISOString())

  // Profile
  database.prepare(
    `INSERT INTO profile (id, name, username, avatar, introduce, github, twitter, email)
     VALUES (1, 'Alex Chen', 'alexchen', NULL, 'A developer passionate about building beautiful web experiences.', 'https://github.com', 'https://twitter.com', 'hello@example.com')`
  ).run()

  // Import seed data from existing lib/sqlite.ts
  // This is a simplified version - the full seed data would be included here
  const now = new Date().toISOString()

  // Categories
  const defaultCategories = [
    { slug: 'tech', name_en: 'Technology', name_zh: '技术', sort_order: 1 },
    { slug: 'life', name_en: 'Life', name_zh: '生活', sort_order: 2 },
    { slug: 'dev', name_en: 'Development', name_zh: '开发', sort_order: 3 },
    { slug: 'design', name_en: 'Design', name_zh: '设计', sort_order: 4 },
  ]

  const insertCategory = database.prepare(
    'INSERT INTO categories (slug, name_en, name_zh, sort_order, created_at) VALUES (?, ?, ?, ?, ?)'
  )
  for (const cat of defaultCategories) {
    insertCategory.run(cat.slug, cat.name_en, cat.name_zh, cat.sort_order, now)
  }

  // Posts
  const posts = [
    {
      slug: 'hello-world',
      category: 'dev',
      translations: [
        { lang: 'en', title: 'Hello World', summary: 'My first blog post about my journey into web development.', content: '# Hello World\n\nWelcome to my blog!' },
        { lang: 'zh', title: '你好，世界', summary: '我的第一篇博客文章，分享我进入 Web 开发世界的旅程。', content: '# 你好，世界\n\n欢迎来到我的博客！' },
      ],
    },
  ]

  const insertPost = database.prepare(
    'INSERT INTO posts (slug, category, cover_image, created_at, updated_at) VALUES (?, ?, NULL, ?, ?)'
  )
  const insertTranslation = database.prepare(
    'INSERT INTO post_translations (post_id, lang, title, summary, content) VALUES (?, ?, ?, ?, ?)'
  )

  for (const post of posts) {
    const info = insertPost.run(post.slug, post.category, now, now)
    const postId = info.lastInsertRowid as number

    for (const t of post.translations) {
      insertTranslation.run(postId, t.lang, t.title, t.summary, t.content)
    }
  }

  // Notes
  const noteData = [
    { nid: 1, en: { title: 'Trying out the new code highlighting', content: 'Today I experimented with Shiki for code highlighting.' }, zh: { title: '尝试新的代码高亮方案', content: '今天我尝试了 Shiki 代码高亮。' } },
  ]

  const insertNote = database.prepare('INSERT INTO notes (nid, created_at) VALUES (?, ?)')
  const insertNoteTranslation = database.prepare('INSERT INTO note_translations (note_id, lang, title, content) VALUES (?, ?, ?, ?)')

  for (const note of noteData) {
    const info = insertNote.run(note.nid, now)
    const noteId = info.lastInsertRowid as number
    insertNoteTranslation.run(noteId, 'en', note.en.title, note.en.content)
    insertNoteTranslation.run(noteId, 'zh', note.zh.title, note.zh.content)
  }

  // Recently / Thoughts
  const thoughts = [
    { content: 'Working through SolidStart has been a wild ride. Retreated back to Next.js for now.', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { content: 'The more I look at the source code, the more I appreciate good architecture.', created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
  ]

  const insertThought = database.prepare('INSERT INTO recently (content, created_at) VALUES (?, ?)')
  for (const t of thoughts) {
    insertThought.run(t.content, t.created_at)
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
