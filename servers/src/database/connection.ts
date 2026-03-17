import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { config } from '../config'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) return db

  const dbPath = config.databasePath
  const dbDir = path.dirname(dbPath)

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
      is_pinned INTEGER DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS recently_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recently_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (recently_id) REFERENCES recently(id) ON DELETE CASCADE
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

  // 数据库迁移：为现有表添加 is_pinned 字段
  migrateDatabase(database)

  // 初始化种子数据
  seedData(database)
}

// 数据库迁移函数
function migrateDatabase(database: Database.Database): void {
  try {
    // 检查 posts 表是否有 is_pinned 列
    const postsColumns = database.prepare("PRAGMA table_info(posts)").all() as Array<{ name: string }>
    const hasPinnedColumn = postsColumns.some((col) => col.name === 'is_pinned')

    if (!hasPinnedColumn) {
      // 添加 is_pinned 列
      database.prepare('ALTER TABLE posts ADD COLUMN is_pinned INTEGER DEFAULT 0').run()
      console.log('Database migration: Added is_pinned column to posts table')
    }
  } catch (error) {
    console.error('Database migration error:', error)
  }

  // 邮箱相关字段迁移
  migrateEmailFields(database)
}

// 邮箱功能数据库迁移
function migrateEmailFields(database: Database.Database): void {
  try {
    const userColumns = database.prepare("PRAGMA table_info(admin_users)").all() as Array<{ name: string }>

    // 添加 email 字段（不使用 UNIQUE 约束，改用唯一索引）
    if (!userColumns.some((col) => col.name === 'email')) {
      database.prepare('ALTER TABLE admin_users ADD COLUMN email TEXT').run()
      console.log('Database migration: Added email column to admin_users table')
    }

    // 添加 email_verified 字段
    if (!userColumns.some((col) => col.name === 'email_verified')) {
      database.prepare('ALTER TABLE admin_users ADD COLUMN email_verified INTEGER DEFAULT 0').run()
      console.log('Database migration: Added email_verified column to admin_users table')
    }

    // 添加 email_verification_token 字段
    if (!userColumns.some((col) => col.name === 'email_verification_token')) {
      database.prepare('ALTER TABLE admin_users ADD COLUMN email_verification_token TEXT').run()
      console.log('Database migration: Added email_verification_token column to admin_users table')
    }

    // 添加 email_verification_expires 字段
    if (!userColumns.some((col) => col.name === 'email_verification_expires')) {
      database.prepare('ALTER TABLE admin_users ADD COLUMN email_verification_expires TEXT').run()
      console.log('Database migration: Added email_verification_expires column to admin_users table')
    }

    // 添加 password_reset_token 字段
    if (!userColumns.some((col) => col.name === 'password_reset_token')) {
      database.prepare('ALTER TABLE admin_users ADD COLUMN password_reset_token TEXT').run()
      console.log('Database migration: Added password_reset_token column to admin_users table')
    }

    // 添加 password_reset_expires 字段
    if (!userColumns.some((col) => col.name === 'password_reset_expires')) {
      database.prepare('ALTER TABLE admin_users ADD COLUMN password_reset_expires TEXT').run()
      console.log('Database migration: Added password_reset_expires column to admin_users table')
    }

    // 添加 new_email 字段
    if (!userColumns.some((col) => col.name === 'new_email')) {
      database.prepare('ALTER TABLE admin_users ADD COLUMN new_email TEXT').run()
      console.log('Database migration: Added new_email column to admin_users table')
    }

    // 添加 new_email_verification_token 字段
    if (!userColumns.some((col) => col.name === 'new_email_verification_token')) {
      database.prepare('ALTER TABLE admin_users ADD COLUMN new_email_verification_token TEXT').run()
      console.log('Database migration: Added new_email_verification_token column to admin_users table')
    }

    // 添加 new_email_expires 字段
    if (!userColumns.some((col) => col.name === 'new_email_expires')) {
      database.prepare('ALTER TABLE admin_users ADD COLUMN new_email_expires TEXT').run()
      console.log('Database migration: Added new_email_expires column to admin_users table')
    }

    // 创建唯一索引以提高查询性能并确保邮箱唯一性
    // 使用唯一索引而不是 UNIQUE 约束，这样可以允许多个 NULL 值
    try {
      // 创建唯一索引（过滤 NULL 值，确保非空邮箱唯一）
      database.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON admin_users(email) WHERE email IS NOT NULL').run()
      database.prepare('CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON admin_users(email_verification_token)').run()
      database.prepare('CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON admin_users(password_reset_token)').run()
      console.log('Database migration: Created email-related indexes')
    } catch (indexError) {
      // 索引可能已存在，忽略错误
      console.log('Database migration: Email indexes may already exist')
    }
  } catch (error) {
    console.error('Email fields migration error:', error)
  }
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
     VALUES (1, 'Caitria', 'caitria', NULL, 'A developer passionate about building beautiful web experiences.', 'https://github.com', 'https://twitter.com', 'hello@example.com')`
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
