const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../blog.db');
console.log('Creating database at:', dbPath);

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

console.log('Creating tables...');

// Create users table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    created_at INTEGER NOT NULL
  )
`);

// Create sessions table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Create categories table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL
  )
`);

// Create tags table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

// Create posts table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    cover_image TEXT,
    published INTEGER NOT NULL DEFAULT 0,
    category_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )
`);

// Create post_tags table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  )
`);

// Create comments table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  )
`);

// Create likes table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  )
`);

console.log('Database initialized successfully!');

// Create indexes for better performance
sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id)`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)`);
sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)`);

console.log('Indexes created!');

sqlite.close();
