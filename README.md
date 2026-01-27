# My Blog

一个基于 Next.js 16 构建的现代化个人博客系统，支持 Markdown 写作、代码高亮、评论互动等功能。

## ✨ 功能特性

### 前台功能
- 📝 博客文章展示与阅读
- 🎨 优雅的 Markdown 渲染
- 💻 代码语法高亮
- 🏷️ 文章分类与标签
- 💬 评论系统
- ❤️ 点赞功能
- 👁️ 浏览量统计
- 📅 文章归档
- 🌓 深色/浅色主题切换

### 后台管理
- 📊 数据统计面板
- ✍️ 文章编写与编辑
- 📂 分类管理
- 🏷️ 标签管理
- 💾 本地存储数据管理

## 🛠️ 技术栈

### 核心框架
- **Next.js 16** - React 框架
- **React 19** - UI 库
- **TypeScript** - 类型安全

### 样式与UI
- **Tailwind CSS 4** - 原子化 CSS 框架
- **Radix UI** - 无障碍 UI 组件库
- **Lucide React** - 图标库
- **next-themes** - 主题切换

### 功能库
- **react-markdown** - Markdown 渲染
- **react-syntax-highlighter** - 代码高亮
- **remark-gfm** - GitHub Flavored Markdown
- **SWR** - 数据获取
- **react-hook-form** - 表单管理
- **zod** - 数据验证
- **date-fns** - 日期处理

## 📦 项目结构

```
my-blog/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理后台
│   │   ├── page.tsx       # 后台首页
│   │   ├── new/           # 新建文章
│   │   ├── edit/          # 编辑文章
│   │   └── categories/    # 分类管理
│   ├── blog/              # 博客前台
│   │   ├── posts/         # 文章详情
│   │   ├── archive/       # 归档页面
│   │   └── login/         # 登录页面
│   └── layout.tsx         # 根布局
├── components/            # React 组件
│   ├── ui/               # UI 基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   ├── blog-header.tsx   # 博客头部
│   ├── blog-footer.tsx   # 博客底部
│   ├── post-card.tsx     # 文章卡片
│   ├── post-editor.tsx   # 文章编辑器
│   └── ...              # 其他组件
├── lib/                  # 工具函数
│   ├── store.ts         # 数据存储
│   ├── format.ts        # 格式化工具
│   └── utils.ts         # 通用工具
└── public/              # 静态资源
```

## 🚀 快速开始

### 环境要求

- Node.js 18.17 或更高版本
- pnpm（推荐）或 npm/yarn

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 运行开发服务器

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 📝 使用说明

### 创建文章

1. 访问后台管理页面 `/admin`
2. 点击"新建文章"
3. 填写文章标题、内容、分类和标签
4. 保存文章

### 管理分类

1. 访问 `/admin/categories`
2. 可以添加、编辑、删除分类

### 数据存储

当前版本使用浏览器本地存储（localStorage）存储数据，适合个人博客和演示使用。

## 🎨 UI 组件使用示例

### Button 组件

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default">默认按钮</Button>
<Button variant="outline">描边按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
```

### Card 组件

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>
    内容
  </CardContent>
</Card>
```

### Dialog 组件

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>打开</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>标题</DialogTitle>
    </DialogHeader>
    <div>内容</div>
  </DialogContent>
</Dialog>
```

## 🔧 配置说明

### 主题配置

项目使用 `next-themes` 实现深色/浅色主题切换，配置位于 `app/layout.tsx`。

### 样式定制

主要样式配置文件：
- `tailwind.config.ts` - Tailwind CSS 配置
- `app/globals.css` - 全局样式

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件

---

**享受写作的快乐！** ✨
