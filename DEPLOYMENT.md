# 博客项目部署完整指南

> 本文档详细说明了从 1Panel 面板开始部署博客项目的完整流程，包括问题排查和解决方案。

## 目录

- [1. 前置准备](#1-前置准备)
- [2. 1Panel 面板配置](#2-1panel-面板配置)
- [3. Dockerfile 配置解析](#3-dockerfile-配置解析)
- [4. 完整部署流程](#4-完整部署流程)
- [5. 问题排查指南](#5-问题排查指南)
- [6. 问题复盘与总结](#6-问题复盘与总结)

---

## 1. 前置准备

### 1.1 服务器要求

- **操作系统**: Linux (推荐 Ubuntu 20.04+ 或 CentOS 7+)
- **内存**: 至少 1GB RAM
- **磁盘**: 至少 10GB 可用空间
- **端口**: 确保 3000、3001 端口未被占用

### 1.2 所需软件

- Docker & Docker Compose
- Git
- 1Panel（可选，用于可视化管理）

### 1.3 项目结构

```
blog/
├── web/                    # Next.js 前端
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── servers/                # Koa.js 后端
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   └── database/
├── docker-compose.yml
└── .git/                   # Git 仓库
```

---

## 2. 1Panel 面板配置

### 2.1 安装 1Panel

```bash
curl -sSL https://resource.fit2.cloudaff.com/1panel-ce-installer.sh | bash
```

安装完成后访问：`http://<服务器IP>:10086`

### 2.2 配置 Docker

在 1Panel 中：

1. **应用商店** → 搜索 "Docker"
2. 安装 **Docker 管理** 插件
3. 确认 Docker 服务已启动

### 2.3 配置 Git

1. **应用商店** → 搜索 "Git"
2. 安装 **Git 管理** 插件
3. 或直接在终端安装：

```bash
# CentOS/RHEL
yum install -y git

# Ubuntu/Debian
apt install -y git
```

---

## 3. Dockerfile 配置解析

### 3.1 后端 Dockerfile (servers/Dockerfile)

```dockerfile
# -----------------------------------------------------------------------------
# Blog Servers Backend - Multi-stage Dockerfile
# Koa.js backend with TypeScript and better-sqlite3
# Package manager: pnpm (via Corepack)
# This build runs independently without monorepo workspace
# -----------------------------------------------------------------------------

# -----------------
# Dependencies Stage
# -----------------
FROM node:20-alpine AS deps

# Set working directory
WORKDIR /app

# Enable pnpm via Corepack (使用固定版本避免网络问题)
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite

# Copy package files (independent project, no workspace)
COPY package.json ./

# Install dependencies
RUN pnpm install

# Manually compile better-sqlite3 native module
# 关键步骤：显式编译原生 C++ 模块
RUN cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && \
    npm rebuild 2>&1 || \
    (npx node-gyp rebuild 2>&1 && echo "Build completed")

# -----------------
# Builder Stage
# -----------------
FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build

# -----------------
# Runner Stage
# -----------------
FROM node:20-alpine AS runner

ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app
RUN apk add --no-cache libc6-compat sqlite
RUN corepack enable && corepack prepare pnpm@10 --activate

COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/database && \
    chown -R node:node /app

USER node
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### 3.2 关键配置说明

| 配置项 | 说明 |
|--------|------|
| `python3 make g++ sqlite` | 编译 better-sqlite3 所需工具 |
| `pnpm install` | 安装 Node 依赖 |
| `npm rebuild / node-gyp rebuild` | **关键**：编译原生模块 |
| `libc6-compat` | 运行时兼容性库 |
| `non-root user` | 安全性：以 node 用户运行 |

### 3.3 docker-compose.yml

```yaml
services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: blog-web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - BACKEND_URL=http://servers:3001
    depends_on:
      - servers
    restart: unless-stopped
    networks:
      - blog-network

  servers:
    build:
      context: ./servers
      dockerfile: Dockerfile
    container_name: blog-servers
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - CORS_ORIGIN=https://blog.smob.cc
      - DATABASE_PATH=/app/database/blog.db
      - SESSION_SECRET=your-secret-key-change-in-production
    volumes:
      # 持久化数据库
      - blog-data:/app/database
    restart: unless-stopped
    networks:
      - blog-network

volumes:
  blog-data:
    driver: local

networks:
  blog-network:
    driver: bridge
```

---

## 4. 完整部署流程

### 4.1 首次部署

```bash
# 1. 登录服务器
ssh root@your-server-ip

# 2. 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com | bash -s
curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 3. 克隆项目
cd /root
git clone https://github.com/your-username/blog.git
cd blog

# 4. 构建并启动
docker compose build --no-cache
docker compose up -d

# 5. 查看日志确认
docker compose logs -f
```

### 4.2 更新代码

```bash
cd /root/blog

# 拉取最新代码
git fetch origin
git reset --hard origin/main  # 或 feat/markdown-part

# 重新构建
docker compose down
docker rmi blog-servers blog-web 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

# 检查状态
docker compose ps
docker compose logs -f servers
```

### 4.3 常用运维命令

```bash
# 查看服务状态
docker compose ps

# 查看实时日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f servers
docker compose logs -f web

# 进入容器调试
docker compose exec servers sh
docker compose exec web sh

# 重启服务
docker compose restart

# 完全清理
docker compose down
docker system prune -a

# 只清理容器（保留镜像）
docker compose down
docker compose up -d
```

---

## 5. 问题排查指南

### 5.1 服务无法启动

#### 症状：容器反复重启

```bash
# 查看详细错误
docker compose logs servers

# 进入容器手动检查
docker compose exec servers sh
ls -la /app/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/build/
```

#### 常见错误：`Cannot locate bindings file`

**原因**：better-sqlite3 原生模块未编译

**解决方案**：
1. 确认 Dockerfile 有 node-gyp 编译步骤
2. 清理缓存重新构建
3. 检查 Alpine 版本兼容性

### 5.2 网络连接问题

#### 前端无法连接后端

**检查**：
```bash
# 检查容器网络
docker network inspect blog_blog-network

# 测试容器间连通性
docker compose exec web curl http://servers:3001/api/categories
```

**解决**：确保两容器在同一网络中（docker-compose.yml 已配置）

### 5.3 数据库问题

#### 数据丢失风险

**配置持久化**：
```yaml
volumes:
  blog-data:    # 数据卷会持久化数据库
    driver: local
```

**备份数据**：
```bash
# 导出数据库
docker compose exec servers sh
sqlite3 /app/database/blog.db .dump > backup.sql

# 导入数据库
sqlite3 /app/database/blog.db < backup.sql
```

### 5.4 分支冲突问题

#### 症状：`You have divergent branches`

```bash
# 查看本地和远程分支
git branch -vv

# 方案一：保留远程（推荐）
git fetch origin
git reset --hard origin/feat-markdown-part

# 方案二：保留本地
git pull origin feat/markdown-part --rebase
```

---

## 6. 问题复盘与总结

### 6.1 本次问题回顾

#### 问题现象
- 本地运行正常，服务器部署后返回 502 错误
- 后端服务反复重启，日志显示 `better-sqlite3` 找不到 bindings

#### 错误信息
```
Error: Could not locate the bindings file. Tried:
 → /app/node_modules/.pnpm/better-sqlite3@9.6.0/node_modules/better-sqlite3/build/better_sqlite3.node
```

### 6.2 根本原因分析

#### 原因 1：原生模块未编译
`better-sqlite3` 是一个包含 C++ 代码的原生 Node.js 模块，需要编译成 `.node` 二进制文件才能运行。

#### 原因 2：pnpm 特殊行为
在 Docker 构建中，`pnpm install` 即使设置了 `--ignore-scripts=false`，有时也不会触发 better-sqlite3 的 postinstall 脚本。

#### 原因 3：分支同步问题
服务器上的代码不是最新版本，导致修复的 Dockerfile 没有被应用。

### 6.3 解决方案演进

#### 尝试 1：`--ignore-scripts=false`
```dockerfile
RUN pnpm install --ignore-scripts=false
```
**结果**：❌ 无效，编译仍未触发

#### 尝试 2：`pnpm rebuild`
```dockerfile
RUN pnpm install
RUN pnpm rebuild better-sqlite3
```
**结果**：❌ pnpm rebuild 也没有触发编译

#### 尝试 3：直接 node-gyp 编译 ✅
```dockerfile
RUN cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && \
    npm rebuild 2>&1 || \
    (npx node-gyp rebuild 2>&1 && echo "Build completed")
```
**结果**：✅ 成功！

### 6.4 为什么最终方案有效

1. **直接进入源码目录**：绕过 pnpm 的包装，直接操作
2. **npm rebuild 作为首选**：npm 对原生模块处理更成熟
3. **node-gyp 作为后备**：最底层的编译工具，确保一定执行

### 6.5 经验教训

#### 🔒 Docker 原生模块编译原则

| 原则 | 说明 |
|------|------|
| 显式编译 | 不依赖包管理器的脚本自动执行 |
| 使用 node-gyp | 最可靠的底层编译工具 |
| 验证产物 | 编译后检查 `.node` 文件是否存在 |
| 清理缓存 | 修改 Dockerfile 后务必 `--no-cache` |

#### 📚 pnpm vs npm 原生模块支持

| 特性 | pnpm | npm |
|------|-------|-----|
| 脚本执行 | 需要额外配置 | 默认执行 |
| 原生模块支持 | 有时有问题 | 更成熟 |
| 速度 | 更快 | 稍慢 |
| 仓库共享 | 节省磁盘 | 占用更多 |

**建议**：生产环境 Dockerfile 使用显式编译，不依赖任何包管理器的"智能"行为。

#### 🔧 部署最佳实践

1. **代码同步**
   - 使用 `git reset --hard` 确保代码一致
   - 或设置 `git config pull.rebase true`

2. **构建缓存**
   - 修改 Dockerfile 后必须 `--no-cache`
   - 怀疑缓存问题时 `docker system prune -a`

3. **日志调试**
   - 构建时保存日志：`2>&1 | tee build.log`
   - 查看特定步骤：`grep -E "(npm|node-gyp)" build.log`

4. **版本锁定**
   - package.json 中锁定 better-sqlite3 版本
   - 使用特定版本的 Node.js 基础镜像

---

## 附录：快速参考

### 常用 Docker 命令

```bash
# 查看容器日志
docker logs <container>

# 实时跟踪日志
docker logs -f <container>

# 进入容器
docker exec -it <container> sh

# 查看镜像历史
docker history <image>

# 清理未使用的镜像
docker image prune -a

# 强制删除容器
docker rm -f <container>
```

### Git 常用命令

```bash
# 查看分支状态
git status

# 查看本地和远程分支差异
git branch -vv

# 强制重置到远程
git fetch origin && git reset --hard origin/main

# 放弃本地修改
git checkout -- .

# 查看某文件历史
git log -- <file>
```

### 服务检查清单

部署后逐一检查：

- [ ] `docker compose ps` 显示两个服务都在运行
- [ ] `docker compose logs servers` 无错误
- [ ] `docker compose logs web` 无错误
- [ ] 浏览器访问前端正常
- [ ] API 接口返回正确数据
- [ ] 查看容器日志无错误输出

---

**文档版本**：v1.0
**更新日期**：2025-03-13
**维护者**：蕾姆 (AI Assistant)
