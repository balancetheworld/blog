# Blog Servers Backend - Monorepo Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install build tools for native modules
RUN apk add --no-cache python3 make g++ sqlite

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy workspace config and lockfile from root
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY servers/package.json ./servers/

# Install dependencies
RUN pnpm install --filter @blog/servers

# Copy source and build
COPY servers/tsconfig.json ./servers/
COPY servers/src ./servers/src
RUN pnpm --filter @blog/servers run build

# Setup production environment
ENV NODE_ENV=production PORT=3001
WORKDIR /app/servers

# Create database directory and setup non-root user
RUN mkdir -p /app/servers/database && \
    addgroup -S nodejs && \
    adduser -S nodejs -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001
CMD ["node", "dist/server.js"]
