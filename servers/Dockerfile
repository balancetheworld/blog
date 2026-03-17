# -----------------------------------------------------------------------------
# Blog Servers Backend - Dockerfile
# Koa.js backend with TypeScript and better-sqlite3
# Package manager: pnpm (via Corepack)
# Build context: project root (monorepo)
# -----------------------------------------------------------------------------

# -----------------
# Builder Stage
# -----------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install build tools for native modules
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

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libc6-compat sqlite

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy workspace config files
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY servers/package.json ./servers/package.json

# Install ONLY production dependencies
RUN pnpm install --prod

# Copy built source from builder
COPY --from=builder /app/servers/dist ./dist

# Create directories
RUN mkdir -p database public/uploads && \
    chown -R node:node /app

USER node

WORKDIR /app

EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
