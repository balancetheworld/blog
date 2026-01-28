import { db } from './index'
import { users, sessions, categories, tags, posts, postTags, comments, likes } from './schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('开始填充数据库...')

  // 清空现有数据
  await db.delete(likes)
  await db.delete(comments)
  await db.delete(postTags)
  await db.delete(posts)
  await db.delete(tags)
  await db.delete(categories)
  await db.delete(sessions)
  await db.delete(users)

  console.log('已清空现有数据')

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const userId = Date.now().toString() + '1'
  await db.insert(users).values({
    id: userId,
    username: 'admin',
    password: hashedPassword,
    name: '管理员',
    avatar: null,
    createdAt: new Date()
  })

  console.log('已创建管理员用户 (用户名: admin, 密码: admin123)')

  // 创建会话
  const token = 'demo-session-token-' + Date.now()
  await db.insert(sessions).values({
    id: Date.now().toString() + '2',
    token,
    userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 天后过期
    createdAt: new Date()
  })

  // 创建分类
  const techCategoryId = Date.now().toString() + '3'
  const lifeCategoryId = Date.now().toString() + '4'
  await db.insert(categories).values([
    {
      id: techCategoryId,
      name: '技术',
      slug: 'tech',
      description: '技术相关文章',
      createdAt: new Date()
    },
    {
      id: lifeCategoryId,
      name: '生活',
      slug: 'life',
      description: '生活感悟',
      createdAt: new Date()
    }
  ])

  console.log('已创建分类')

  // 创建标签
  const tagIds = [
    { id: Date.now().toString() + '5', name: 'React', slug: 'react' },
    { id: Date.now().toString() + '6', name: 'TypeScript', slug: 'typescript' },
    { id: Date.now().toString() + '7', name: 'Next.js', slug: 'nextjs' },
    { id: Date.now().toString() + '8', name: '前端', slug: 'frontend' }
  ]

  for (const tag of tagIds) {
    await db.insert(tags).values({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: new Date()
    })
  }

  console.log('已创建标签')

  // 创建文章
  const postIds = [
    Date.now().toString() + '9',
    Date.now().toString() + '10',
    Date.now().toString() + '11'
  ]

  await db.insert(posts).values([
    {
      id: postIds[0],
      title: '欢迎使用你的新博客',
      slug: 'welcome-to-your-new-blog',
      content: `# 欢迎使用你的新博客

这是一个基于 **Next.js** 和 **Express** 构建的现代化博客系统。

## 功能特性

- 📝 Markdown 写作
- 💻 代码高亮
- 🏷️ 分类和标签
- 💬 评论系统
- 🌓 深色模式

## 开始写作

登录后台，开始创作你的第一篇文章吧！

\`\`\`typescript
console.log('Hello, World!')
\`\`\`
`,
      excerpt: '欢迎使用你的新博客！这是一个基于 Next.js 和 Express 构建的现代化博客系统。',
      coverImage: null,
      published: 1,
      categoryId: techCategoryId,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: postIds[1],
      title: 'React Hooks 入门指南',
      slug: 'react-hooks-guide',
      content: `# React Hooks 入门指南

Hooks 是 React 16.8 引入的新特性。

## useState

\`\`\`tsx
const [count, setCount] = useState(0)
\`\`\`

## useEffect

\`\`\`tsx
useEffect(() => {
  document.title = \`Count: \${count}\`
}, [count])
\`\`\`
`,
      excerpt: 'React Hooks 让函数组件拥有状态和生命周期特性。',
      coverImage: null,
      published: 1,
      categoryId: techCategoryId,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: postIds[2],
      title: '生活感悟',
      slug: 'life-reflections',
      content: `# 生活感悟

记录生活中的点点滴滴...

## 今天的心情

今天天气不错，心情也很好！
`,
      excerpt: '记录生活中的美好瞬间。',
      coverImage: null,
      published: 1,
      categoryId: lifeCategoryId,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  console.log('已创建文章')

  // 关联标签
  await db.insert(postTags).values([
    { postId: postIds[0], tagId: tagIds[2].id }, // 欢迎文章 - Next.js
    { postId: postIds[1], tagId: tagIds[0].id }, // React - React
    { postId: postIds[1], tagId: tagIds[1].id }, // React - TypeScript
    { postId: postIds[1], tagId: tagIds[3].id }, // React - 前端
  ])

  console.log('已关联标签')

  // 创建评论
  await db.insert(comments).values([
    {
      id: Date.now().toString() + '12',
      postId: postIds[0],
      author: '访客',
      content: '恭喜博客搭建成功！',
      createdAt: new Date()
    }
  ])

  console.log('已创建评论')

  console.log('数据库填充完成！')
  console.log('\n登录信息:')
  console.log('  用户名: admin')
  console.log('  密码: admin123')
  console.log('\n会话令牌:', token)
}

seed().catch(console.error)
