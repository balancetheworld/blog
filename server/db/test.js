import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '../../blog.db')
const sqlite = new Database(dbPath)

console.log('=== 数据库测试 ===\n')

// 测试用户
console.log('1. 测试用户表:')
const users = sqlite.prepare('SELECT id, username, name FROM users').all()
console.log('  用户数量:', users.length)
users.forEach(user => {
  console.log(`  - ${user.username} (${user.name})`)
})

// 测试分类
console.log('\n2. 测试分类表:')
const categories = sqlite.prepare('SELECT id, name, slug FROM categories').all()
console.log('  分类数量:', categories.length)
categories.forEach(cat => {
  console.log(`  - ${cat.name} (${cat.slug})`)
})

// 测试文章
console.log('\n3. 测试文章表:')
const posts = sqlite.prepare('SELECT id, title, published, views, likes FROM posts').all()
console.log('  文章数量:', posts.length)
posts.forEach(post => {
  console.log(`  - ${post.title} [${post.published ? '已发布' : '草稿'}] ${post.views}浏览 ${post.likes}点赞`)
})

// 测试评论
console.log('\n4. 测试评论表:')
const comments = sqlite.prepare('SELECT COUNT(*) as count FROM comments').get()
console.log('  评论数量:', comments.count)

// 测试会话
console.log('\n5. 测试会话表:')
const sessions = sqlite.prepare('SELECT COUNT(*) as count FROM sessions').get()
console.log('  会话数量:', sessions.count)

console.log('\n=== 测试完成 ===')
console.log('\n默认登录信息:')
console.log('  用户名: admin')
console.log('  密码: admin123')

sqlite.close()
