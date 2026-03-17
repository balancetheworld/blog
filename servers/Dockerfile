# -----------------------------------------------------------------------------
# Blog Servers Backend - Dockerfile
# Koa.js backend with TypeScript and better-sqlite3
# Package manager: pnpm (via Corepack)
# Build context: project root (monorepo)
# -----------------------------------------------------------------------------

# -----------------
# Dependencies Stage
# -----------------
FROM node:20-alpine AS deps

# Set working directory
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite

# Copy monorepo package files
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy servers package.json
COPY servers/package.json ./servers/package.json

# Install dependencies
RUN pnpm install

# Change to servers directory for rebuild
WORKDIR /app/servers

# Rebuild better-sqlite3 for Alpine
RUN pnpm rebuild better-sqlite3

# -----------------
# Builder Stage
# -----------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install build tools
RUN apk add --no-cache python3 make g++

# Copy monorepo config
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY servers/package.json ./servers/package.json

# Install all dependencies (including devDependencies for TypeScript)
RUN pnpm install

# Copy servers source
COPY servers/tsconfig.json ./servers/tsconfig.json
COPY servers/src ./servers/src

# Build TypeScript
WORKDIR /app/servers
RUN pnpm run build

# -----------------
# Runner Stage
# -----------------
FROM node:20-alpine AS runner

# Set environment
ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app/servers

# Install runtime dependencies
RUN apk add --no-cache libc6-compat sqlite

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package.json
COPY servers/package.json ./servers/package.json

# Copy only production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built source
COPY --from=builder /app/servers/dist ./dist

# Create directories
RUN mkdir -p /app/database /app/public/uploads && \
    chown -R node:node /app

USER node

EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
