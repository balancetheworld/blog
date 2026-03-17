# -----------------------------------------------------------------------------
# Blog Web Frontend - Multi-stage Dockerfile
# Next.js 16 with standalone output for optimized production builds
# Package manager: pnpm (via Corepack)
# Build context: project root (monorepo)
# -----------------------------------------------------------------------------

# -----------------
# Builder Stage
# -----------------
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy monorepo package files
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy web package.json
COPY web/package.json ./web/package.json

# Install dependencies
RUN pnpm install

# Copy web source
COPY web/src ./web/src
COPY web/public ./web/public

# Build Next.js application
WORKDIR /app/web
RUN pnpm run build

# -----------------
# Runner Stage
# -----------------
FROM node:24-alpine AS runner

# Set production environment
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    BACKEND_URL=http://servers:3001

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Create non-root user for security
RUN addgroup -S nodejs && \
    adduser -S nextjs -G nodejs

# Copy necessary files from builder
COPY --from=builder /app/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
