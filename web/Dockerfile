# -----------------------------------------------------------------------------
# Blog Web Frontend - Multi-stage Dockerfile
# Next.js 16 with standalone output for optimized production builds
# Package manager: pnpm (via Corepack)
# This build runs independently without monorepo workspace
# -----------------------------------------------------------------------------

# -----------------
# Builder Stage
# -----------------
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files (independent project, no workspace)
COPY package.json ./

# Install dependencies (with fallback if no lockfile)
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Copy source code
COPY . .

# Build Next.js application (standalone mode configured in next.config.mjs)
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

# Enable pnpm via Corepack (not strictly needed in runner)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user for security
RUN addgroup -S nodejs && \
    adduser -S nextjs -G nodejs

# Copy necessary files from builder
# Standalone output contains server.js and all required dependencies
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
