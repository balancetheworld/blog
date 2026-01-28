# My Blog

前后端分离的现代化个人博客系统。

## 架构

- **前端**: Next.js 16 (App Router) + React 19 + TypeScript
- **后端**: Express + TypeScript + Drizzle ORM
- **数据库**: SQLite

## 详细目录结构

```
my-blog/
├── web/                           # Next.js 前端应用
│   ├── app/                       # Next.js App Router 页面
│   │   ├── admin/                 # 管理后台
│   │   │   ├── page.tsx          # 后台首页（仪表盘）
│   │   │   ├── new/              # 新建文章页面
│   │   │   ├── edit/             # 编辑文章页面
│   │   │   │   └── [id]/page.tsx
│   │   │   └── categories/       # 分类管理页面
│   │   │       └── page.tsx
│   │   ├── blog/                 # 博客前台
│   │   │   ├── page.tsx          # 首页
│   │   │   ├── posts/            # 文章详情
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── archive/          # 归档页面
│   │   │   │   └── page.tsx
│   │   │   ├── category/         # 分类页面
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── login/            # 登录页面
│   │   │       └── page.tsx
│   │   ├── layout.tsx            # 根布局
│   │   ├── globals.css           # 全局样式
│   │   └── favicon.ico           # 网站图标
│   ├── components/               # React 组件
│   │   ├── ui/                   # UI 基础组件（shadcn/ui）
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── ...
│   │   ├── blog-header.tsx       # 博客头部导航
│   │   ├── blog-footer.tsx       # 博客底部
│   │   ├── post-card.tsx         # 文章卡片
│   │   ├── post-editor.tsx       # Markdown 编辑器
│   │   ├── theme-toggle.tsx      # 主题切换
│   │   └── ...
│   ├── lib/                      # 工具函数
│   │   ├── api.ts               # API 客户端（封装 fetch）
│   │   ├── store.ts             # 数据访问层
│   │   ├── format.ts            # 格式化工具
│   │   └── utils.ts             # 通用工具
│   ├── public/                   # 静态资源
│   │   └── images/              # 图片资源
│   ├── next.config.ts           # Next.js 配置
│   ├── tsconfig.json            # TypeScript 配置
│   ├── postcss.config.mjs       # PostCSS 配置
│   ├── eslint.config.mjs        # ESLint 配置
│   ├── package.json             # 前端依赖
│   └── .env.example             # 环境变量示例
│
├── server/                       # Express API 后端服务
│   └── src/                      # 源代码
│       ├── index.ts              # 服务器入口文件
│       ├── routes/               # API 路由
│       │   ├── posts.ts          # 文章路由
│       │   │   ├── GET    /      # 获取所有文章
│       │   │   ├── GET    /:slug # 获取单篇文章
│       │   │   ├── POST   /      # 创建文章
│       │   │   ├── PUT    /:id   # 更新文章
│       │   │   ├── DELETE /:id   # 删除文章
│       │   │   ├── POST   /:id/views # 增加浏览量
│       │   │   └── POST   /:id/like  # 切换点赞
│       │   ├── auth.ts           # 认证路由
│       │   │   ├── POST   /login    # 登录
│       │   │   ├── GET    /verify   # 验证会话
│       │   │   └── POST   /logout   # 登出
│       │   ├── categories.ts     # 分类路由
│       │   │   ├── GET    /              # 获取所有分类
│       │   │   ├── GET    /:id           # 获取单个分类
│       │   │   ├── POST   /              # 创建分类
│       │   │   ├── PUT    /:id           # 更新分类
│       │   │   ├── DELETE /:id           # 删除分类
│       │   │   └── GET    /:id/post-count # 获取文章数量
│       │   └── comments.ts       # 评论路由
│       │       ├── GET /post/:postId      # 获取文章评论
│       │       ├── POST /                  # 创建评论
│       │       ├── DELETE /:id             # 删除评论
│       │       └── GET /post/:postId/count # 获取评论数
│       ├── services/              # 业务逻辑层
│       │   ├── post.service.ts    # 文章服务
│       │   ├── auth.service.ts    # 认证服务
│       │   ├── category.service.ts # 分类服务
│       │   └── comment.service.ts # 评论服务
│       ├── db/                    # 数据库
│       │   ├── schema.ts          # 数据库 Schema（表定义）
│       │   ├── index.ts           # 数据库连接
│       │   ├── seed.ts            # 种子数据
│       │   └── migrations/        # 数据库迁移文件
│       │       └── meta/
│       └── middleware/            # 中间件
│           └── auth.middleware.ts # 认证中间件
│   ├── drizzle.config.ts         # Drizzle 配置
│   ├── tsconfig.json             # TypeScript 配置
│   ├── package.json              # 后端依赖
│   └── .env.example              # 环境变量示例
│
├── shared/                        # 共享代码（可选）
│   ├── types/                    # 共享类型定义
│   └── utils/                    # 共享工具函数
│
├── .env                          # 环境变量（本地）
├── .env.example                  # 环境变量示例
├── .gitignore                    # Git 忽略文件
├── package.json                  # Monorepo 根配置
├── pnpm-workspace.yaml           # pnpm workspace 配置
├── pnpm-lock.yaml                # 依赖锁定文件
├── blog.db                       # SQLite 数据库文件
└── README.md                     # 项目说明
```

## 目录说明

### 前端 (web/)

**app/** - Next.js App Router 目录
- 使用文件系统路由
- 支持 Server Components 和 Client Components
- 布局和页面组件

**components/** - React 组件
- `ui/` - 基础 UI 组件（基于 shadcn/ui）
- 业务组件（文章卡片、编辑器等）

**lib/** - 工具函数和客户端
- `api.ts` - 封装的 API 请求客户端
- `store.ts` - 数据访问层（调用后端 API）
- `format.ts` - 日期、数字格式化
- `utils.ts` - 通用工具函数

### 后端 (server/)

**src/routes/** - API 路由定义
- 定义 HTTP 端点
- 请求参数验证
- 调用 service 层处理业务逻辑

**src/services/** - 业务逻辑层
- 数据库操作
- 业务规则处理
- 事务管理

**src/db/** - 数据库层
- Schema 定义（表结构、关系）
- 数据库连接
- 迁移文件

**src/middleware/** - 中间件
- 认证
- 日志
- 错误处理

## 功能特性

- 📝 Markdown 文章编辑与渲染
- 💻 代码语法高亮
- 🏷️ 分类与标签管理
- 💬 评论与点赞系统
- 🌓 深色/浅色主题切换
- 🔐 管理后台

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖（前端 + 后端）
pnpm install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env
cp web/.env.example web/.env
cp server/.env.example server/.env

# 根据需要修改配置
# .env 配置说明：
# NEXT_PUBLIC_API_URL=http://localhost:3001  # 前端调用后端的地址
# PORT=3001                                  # 后端服务端口
# FRONTEND_URL=http://localhost:3000         # CORS 允许的前端地址
# DATABASE_URL=./blog.db                     # 数据库文件路径
```

### 3. 数据库初始化

```bash
cd server

# 推送数据库 schema
pnpm db:push

# 填充种子数据（可选）
pnpm db:seed
```

### 4. 启动开发服务器

```bash
# 方式 1: 同时启动前后端（推荐）
pnpm dev
# 前端: http://localhost:3000
# 后端: http://localhost:3001

# 方式 2: 分别启动
pnpm dev:web     # 仅前端
pnpm dev:server  # 仅后端
```

### 5. 访问应用

- 前台首页: http://localhost:3000/blog
- 管理后台: http://localhost:3000/admin
- API 文档: 见下方 API 接口部分

## API 接口文档

### 基础 URL

```
开发环境: http://localhost:3001
生产环境: 根据部署配置
```

### 文章接口

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | `/api/posts` | 获取所有文章 | `sortBy`: latest/popular, `categoryId`: 分类 ID |
| GET | `/api/posts/:slug` | 获取单篇文章 | `slug`: 文章 slug |
| GET | `/api/posts/admin` | 获取所有文章（后台） | - |
| POST | `/api/posts` | 创建文章 | Body: 文章数据 |
| PUT | `/api/posts/:id` | 更新文章 | Body: 文章数据 |
| DELETE | `/api/posts/:id` | 删除文章 | - |
| POST | `/api/posts/:id/views` | 增加浏览量 | - |
| POST | `/api/posts/:id/like` | 切换点赞 | Body: `{ visitorId }` |
| GET | `/api/posts/:id/like` | 检查点赞状态 | Query: `visitorId` |

### 分类接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/categories` | 获取所有分类 |
| GET | `/api/categories/:id` | 获取单个分类 |
| POST | `/api/categories` | 创建分类 |
| PUT | `/api/categories/:id` | 更新分类 |
| DELETE | `/api/categories/:id` | 删除分类 |
| GET | `/api/categories/:id/post-count` | 获取分类文章数 |

### 评论接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/comments/post/:postId` | 获取文章评论 |
| POST | `/api/comments` | 创建评论 |
| DELETE | `/api/comments/:id` | 删除评论 |

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/verify` | 验证会话 |
| POST | `/api/auth/logout` | 登出 |

### 健康检查

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/health` | 服务健康状态 |

## 数据库 Schema

### users - 用户表
- id (主键)
- username (用户名，唯一)
- password (密码哈希)
- name (显示名称)
- avatar (头像 URL)
- created_at (创建时间)

### sessions - 会话表
- id (主键)
- token (会话令牌，唯一)
- user_id (外键 → users.id)
- expires_at (过期时间)
- created_at (创建时间)

### categories - 分类表
- id (主键)
- name (分类名称，唯一)
- slug (URL 别名，唯一)
- description (描述)
- created_at (创建时间)

### tags - 标签表
- id (主键)
- name (标签名称，唯一)
- slug (URL 别名，唯一)
- created_at (创建时间)

### posts - 文章表
- id (主键)
- title (标题)
- slug (URL 别名，唯一)
- content (内容，Markdown)
- excerpt (摘要)
- cover_image (封面图)
- published (是否发布)
- category_id (外键 → categories.id)
- created_at (创建时间)
- updated_at (更新时间)
- views (浏览量)
- likes (点赞数)

### post_tags - 文章标签关联表
- post_id (外键 → posts.id)
- tag_id (外键 → tags.id)
- 主键: (post_id, tag_id)

### comments - 评论表
- id (主键)
- post_id (外键 → posts.id)
- author (作者)
- content (内容)
- created_at (创建时间)

### likes - 点赞记录表
- id (主键)
- post_id (外键 → posts.id)
- visitor_id (访客 ID)
- created_at (创建时间)

## 构建

```bash
# 构建前后端
pnpm build

# 分别构建
pnpm build:web
pnpm build:server
```

## 生产部署

```bash
# 启动生产服务
pnpm start

# 或分别启动
pnpm start:web
pnpm start:server
```

## 技术栈详解

### 前端技术栈

**核心框架**
- Next.js 16 - React 全栈框架
- React 19 - UI 库
- TypeScript - 类型安全

**样式方案**
- Tailwind CSS 4 - 原子化 CSS
- Radix UI - 无障碍组件库
- next-themes - 主题管理

**功能库**
- react-markdown - Markdown 渲染
- react-syntax-highlighter - 代码高亮
- SWR - 数据获取和缓存
- react-hook-form - 表单管理
- zod - 数据验证

### 后端技术栈

**核心框架**
- Express - Web 框架
- TypeScript - 类型安全

**数据库**
- SQLite - 嵌入式数据库
- Drizzle ORM - ORM 框架
- better-sqlite3 - SQLite 驱动

**功能库**
- cors - 跨域支持
- bcryptjs - 密码加密
- date-fns - 日期处理

## 开发建议

1. **代码规范**
   - 使用 TypeScript 严格模式
   - 遵循 ESLint 规则
   - 组件使用 PascalCase
   - 文件名使用 kebab-case

2. **Git 提交规范**
   - feat: 新功能
   - fix: 修复 bug
   - docs: 文档更新
   - style: 代码格式调整
   - refactor: 重构
   - test: 测试相关
   - chore: 构建/工具变动

3. **分支管理**
   - main - 主分支
   - develop - 开发分支
   - feature/* - 功能分支
   - fix/* - 修复分支

## 常见问题

### Q: 如何修改数据库？
```bash
cd server
# 修改 schema.ts 后
pnpm db:push  # 开发环境
pnpm db:generate # 生成迁移文件
```

### Q: 前端如何调用 API？
```typescript
import { api } from '@/lib/api'

// GET 请求
const data = await api.get('/api/posts')

// POST 请求
const result = await api.post('/api/posts', { title: '...' })
```

### Q: 如何添加新的 API 接口？
1. 在 `server/src/services/` 添加业务逻辑
2. 在 `server/src/routes/` 添加路由
3. 在 `server/src/index.ts` 注册路由

## License

MIT
