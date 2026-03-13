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
COPY pnpm-lock.yaml* ./

# Install dependencies (enable build scripts for native modules)
# Don't use --frozen-lockfile because we have overrides that may cause mismatch
RUN pnpm install

# -----------------
# Builder Stage
# -----------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install build tools (needed in case we need to rebuild)
RUN apk add --no-cache python3 make g++

# Copy node_modules from deps stage (includes compiled better-sqlite3)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN pnpm run build

# -----------------
# Runner Stage
# -----------------
FROM node:20-alpine AS runner

# Set production environment
ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app

# Install runtime dependencies (shared libraries for native modules)
RUN apk add --no-cache libc6-compat sqlite

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package.json for metadata
COPY package.json ./

# Copy ENTIRE node_modules from deps (includes compiled .node files)
# This is crucial for better-sqlite3!
COPY --from=deps /app/node_modules ./node_modules

# Copy built source
COPY --from=builder /app/dist ./dist

# Create database directory and set permissions
RUN mkdir -p /app/database && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose application port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
