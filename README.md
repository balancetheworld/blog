# My Blog

前后端分离的现代化个人博客系统。

## 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript
- **后端**: Express + TypeScript + Drizzle ORM
- **数据库**: SQLite
- **样式**: Tailwind CSS

## 主要功能

- 📝 Markdown 文章编辑
- 💻 代码语法高亮
- 🏷️ 分类与标签管理
- 💬 评论与点赞系统
- 🔐 管理后台

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 初始化数据库

```bash
cd server
pnpm db:push
pnpm db:seed
```

### 3. 启动开发服务器

```bash
# 同时启动前后端
pnpm dev

# 或分别启动
pnpm dev:web     # 前端: http://localhost:3000
pnpm dev:server  # 后端: http://localhost:3001
```

### 4. 访问应用

- 前台首页: http://localhost:3000
- 管理后台: http://localhost:3000/admin
- 默认账号: `admin` / `admin123`

## 项目结构

```
my-blog/
├── web/           # Next.js 前端
│   ├── app/       # 页面路由
│   ├── components/# React 组件
│   └── lib/       # 工具函数
└── server/        # Express 后端
    └── src/
        ├── routes/   # API 路由
        ├── services/# 业务逻辑
        └── db/      # 数据库
```

## 常用命令

```bash
# 数据库相关
pnpm db:push      # 推送 schema
pnpm db:seed      # 填充示例数据
pnpm db:studio    # 打开数据库管理界面

# 构建相关
pnpm build        # 构建前后端
pnpm start        # 启动生产服务
```

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/posts` | 获取所有文章 |
| GET | `/api/posts/:slug` | 获取单篇文章 |
| POST | `/api/posts` | 创建文章 |
| PUT | `/api/posts/:id` | 更新文章 |
| DELETE | `/api/posts/:id` | 删除文章 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/comments` | 创建评论 |

## License

MIT
