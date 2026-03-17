# -----------------------------------------------------------------------------
# Blog Servers Backend - Dockerfile
# Koa.js backend with TypeScript and better-sqlite3
# Package manager: pnpm (via Corepack)
# Build context: project root (monorepo)
# -----------------------------------------------------------------------------

FROM node:20-alpine

# Set environment
ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app

# Install runtime and build dependencies
RUN apk add --no-cache libc6-compat sqlite python3 make g++

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy monorepo config files (required for pnpm workspace)
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY pnpm-lock.yaml ./pnpm-lock.yaml

# Copy servers package files
COPY servers/package.json ./servers/package.json
COPY servers/tsconfig.json ./servers/tsconfig.json

# Copy source code
COPY servers/src ./servers/src

# Install all dependencies
RUN pnpm install

# Build TypeScript
RUN pnpm --dir /app/servers run build

# Rebuild better-sqlite3 for Alpine
RUN pnpm rebuild better-sqlite3

# Verify the .node file exists
RUN ls -la /app/node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/build/ || echo "Build artifacts not found"

# Create directories
RUN mkdir -p /app/database /app/public/uploads && \
    chown -R node:node /app

USER node

WORKDIR /app/servers

EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
