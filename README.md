# My Blog

基于 Next.js 16 + Drizzle ORM 构建的现代化个人博客系统，支持 Markdown 写作、评论互动等功能。

## 功能特性

- 📝 Markdown 文章编辑与渲染
- 💻 代码语法高亮
- 🏷️ 分类与标签管理
- 💬 评论与点赞系统
- 🌓 深色/浅色主题切换
- 🔐 管理后台

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19 + TypeScript
- **数据库**: SQLite + Drizzle ORM
- **样式**: Tailwind CSS 4 + Radix UI
- **功能**: react-markdown, SWR, react-hook-form, zod

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

## 项目结构

```
my-blog/
├── app/              # Next.js App Router
│   ├── admin/        # 管理后台
│   └── blog/         # 博客前台
├── components/       # React 组件
│   └── ui/          # UI 基础组件
├── lib/             # 工具函数
├── server/          # 服务端代码
│   ├── db/          # 数据库 schema
│   └── services/    # 业务逻辑
└── public/          # 静态资源
```

## 数据库

使用 SQLite + Drizzle ORM，数据存储在 `blog.db`。

数据库配置: `server/db/schema.ts`

## 构建

```bash
# 生产构建
pnpm build

# 启动生产服务器
pnpm start
```

## License

MIT
