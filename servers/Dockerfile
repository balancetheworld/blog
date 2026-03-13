# -----------------------------------------------------------------------------
# Blog Servers Backend - Single-stage Dockerfile
# Koa.js backend with TypeScript and better-sqlite3
# Package manager: pnpm (via Corepack)
# Using single-stage build to avoid native module issues
# -----------------------------------------------------------------------------

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./
COPY tsconfig.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN pnpm run build

# Set production environment
ENV NODE_ENV=production \
    PORT=3001

# Create database directory and set permissions
RUN mkdir -p /app/database

# Switch to non-root user
RUN addgroup -S nodejs && \
    adduser -S nodejs -G nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

# Expose application port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
