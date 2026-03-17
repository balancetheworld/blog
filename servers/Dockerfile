# -----------------------------------------------------------------------------
# Blog Servers Backend - Dockerfile
# Koa.js backend with TypeScript and better-sqlite3
# Package manager: pnpm (via Corepack)
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

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --ignore-scripts=false

# Rebuild better-sqlite3 for Alpine
RUN pnpm rebuild better-sqlite3

# -----------------
# Builder Stage
# -----------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN pnpm run build

# -----------------
# Runner Stage
# -----------------
FROM node:20-alpine AS runner

# Set environment
ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libc6-compat sqlite

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package.json
COPY package.json ./

# Copy compiled dependencies with native modules
COPY --from=deps /app/node_modules ./node_modules

# Copy built source
COPY --from=builder /app/dist ./dist

# Create directories
RUN mkdir -p /app/database /app/public/uploads && \
    chown -R node:node /app

USER node

EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
