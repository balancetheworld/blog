# -----------------------------------------------------------------------------
# Blog Web Frontend - Dockerfile
# Next.js 16 with standalone output for optimized production builds
# Package manager: pnpm (via Corepack)
# Build context: project root (monorepo)
# -----------------------------------------------------------------------------

# -----------------
# Builder Stage
# -----------------
FROM node:24-alpine AS builder

WORKDIR /app

ARG BACKEND_URL=http://servers:3001
ENV BACKEND_URL=${BACKEND_URL}

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy monorepo config files
COPY package.json ./package.json
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY pnpm-lock.yaml ./pnpm-lock.yaml

# Copy web package files
COPY web/package.json ./web/package.json
COPY web/tsconfig.json ./web/tsconfig.json
COPY web/next.config.mjs ./web/next.config.mjs

# Copy all web source files
COPY web ./web

# Install dependencies and build
RUN pnpm --dir /app/web install
RUN pnpm --dir /app/web run build

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

# Create non-root user
RUN addgroup -S nodejs && \
    adduser -S nextjs -G nodejs

# Copy standalone output structure:
# standalone/
#   ├── node_modules/    -> /app/node_modules/
#   └── web/             -> /app/web/
#       └── server.js    -> /app/web/server.js
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/standalone/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/standalone/web ./web

# Copy .next/static (NOT included in standalone, required for Next.js)
COPY --from=builder --chown=nextjs:nodejs /app/web/.next/static ./web/.next/static

# Copy public assets (Next.js expects public/ relative to server.js location)
COPY --from=builder --chown=nextjs:nodejs /app/web/public ./web/public

USER nextjs

WORKDIR /app/web

EXPOSE 3000

CMD ["node", "server.js"]
