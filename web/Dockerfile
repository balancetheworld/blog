# -----------------------------------------------------------------------------
# Blog Web Frontend - Dockerfile
# Next.js 16 with standalone output for optimized production builds
# Package manager: pnpm (via Corepack)
# Build context: project root (monorepo)
# -----------------------------------------------------------------------------

FROM node:24-alpine

# Set production environment
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    BACKEND_URL=http://servers:3001

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy monorepo config files
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY pnpm-lock.yaml ./pnpm-lock.yaml

# Copy web package files
COPY web/package.json ./web/package.json
COPY web/tsconfig.json ./web/tsconfig.json
COPY web/next.config.mjs ./web/next.config.mjs

# Copy all web source files
COPY web ./web

# Install dependencies and build
WORKDIR /app/web
RUN pnpm install && \
    pnpm run build

# Create non-root user
RUN addgroup -S nodejs && \
    adduser -S nextjs -G nodejs && \
    chown -R nextjs:nodejs /app

USER nextjs

# WORKDIR is /app/web
# standalone server.js is at /app/web/.next/standalone/server.js
# but Next.js expects to run from the web directory

WORKDIR /app/web

EXPOSE 3000

# Start the server from standalone
CMD ["node", ".next/standalone/server.js"]
