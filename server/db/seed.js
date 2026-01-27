import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../blog.db');
const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

console.log('Seeding database...');

// Check if data already exists
const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount > 0) {
  console.log('Database already seeded. Skipping...');
  sqlite.close();
  process.exit(0);
}

// Hash password
const password = await bcrypt.hash('admin123', 10);

// Insert user
const userId = '1';
sqlite.prepare(`
  INSERT INTO users (id, username, password, name, created_at)
  VALUES (?, ?, ?, ?, ?)
`).run(userId, 'admin', password, '博主', Date.now());

// Insert categories
const categories = [
  { id: '1', name: '技术', slug: 'tech', description: '技术相关的文章，包括编程、开发工具等' },
  { id: '2', name: '生活', slug: 'life', description: '生活感悟、日常记录' },
  { id: '3', name: '随笔', slug: 'essay', description: '随想随写，思考与感悟' }
];

const insertCategory = sqlite.prepare(`
  INSERT INTO categories (id, name, slug, description, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

categories.forEach(cat => {
  insertCategory.run(cat.id, cat.name, cat.slug, cat.description, Date.now());
});

// Insert posts
const posts = [
  {
    id: '1',
    title: '欢迎来到我的博客',
    slug: 'welcome-to-my-blog',
    content: `# 欢迎来到我的博客

这是我的第一篇博客文章！在这里，我将分享我的技术学习心得和生活感悟。

## 关于这个博客

这个博客使用 **Next.js** 构建，支持 Markdown 语法，让写作变得更加简单。

### 特性

- 支持 Markdown 语法
- 代码高亮显示
- 响应式设计
- 文章归档功能

\`\`\`javascript
// 示例代码
function hello() {
  console.log('Hello, World!');
}
\`\`\`

感谢你的访问！`,
    excerpt: '这是我的第一篇博客文章！在这里，我将分享我的技术学习心得和生活感悟。',
    published: 1,
    category_id: '3',
    views: 156,
    likes: 23
  },
  {
    id: '2',
    title: 'Next.js 入门指南',
    slug: 'nextjs-getting-started',
    content: `# Next.js 入门指南

Next.js 是一个基于 React 的全栈框架，它提供了许多开箱即用的功能。

## 为什么选择 Next.js？

1. **服务端渲染 (SSR)** - 更好的 SEO 和首屏加载速度
2. **静态生成 (SSG)** - 预渲染页面，极致性能
3. **API 路由** - 内置后端功能
4. **文件系统路由** - 简单直观的路由方式

## 快速开始

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

希望这篇文章对你有帮助！`,
    excerpt: 'Next.js 是一个基于 React 的全栈框架，它提供了许多开箱即用的功能。',
    published: 1,
    category_id: '1',
    views: 342,
    likes: 45
  },
  {
    id: '3',
    title: 'Markdown 写作技巧',
    slug: 'markdown-writing-tips',
    content: `# Markdown 写作技巧

Markdown 是一种轻量级标记语言，让你专注于内容而非格式。

## 基本语法

### 标题

使用 \`#\` 号来创建标题。

### 强调

- **粗体**: \`**文字**\`
- *斜体*: \`*文字*\`
- ~~删除线~~: \`~~文字~~\`

掌握这些技巧，让你的写作更加高效！`,
    excerpt: 'Markdown 是一种轻量级标记语言，让你专注于内容而非格式。',
    published: 1,
    category_id: '1',
    views: 89,
    likes: 12
  }
];

const insertPost = sqlite.prepare(`
  INSERT INTO posts (id, title, slug, content, excerpt, published, category_id, created_at, updated_at, views, likes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const now = Date.now();
posts.forEach(post => {
  insertPost.run(
    post.id,
    post.title,
    post.slug,
    post.content,
    post.excerpt,
    post.published,
    post.category_id,
    now,
    now,
    post.views,
    post.likes
  );
});

// Insert comments
const comments = [
  { id: '1', post_id: '1', author: '访客小明', content: '博客写得很好，期待更多内容！' },
  { id: '2', post_id: '2', author: '学习者', content: 'Next.js 确实很强大，这篇教程帮到我了，谢谢！' },
  { id: '3', post_id: '2', author: '前端开发者', content: '请问有更详细的 API 路由教程吗？' }
];

const insertComment = sqlite.prepare(`
  INSERT INTO comments (id, post_id, author, content, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

comments.forEach(comment => {
  insertComment.run(comment.id, comment.post_id, comment.author, comment.content, now);
});

console.log('Database seeded successfully!');
console.log('Default user: admin / admin123');

sqlite.close();
