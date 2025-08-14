# =====================================================
# FLASHFUSION UNIFIED - MULTI-STAGE DOCKER BUILD
# Production-optimized containerized deployment
# =====================================================

# =====================================================
# Stage 1: Build Dependencies
# =====================================================
FROM node:18-alpine AS deps
WORKDIR /app

# Install system dependencies for building
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./
COPY agents/lyra/dashboard/package*.json ./agents/lyra/dashboard/

# Install dependencies
RUN npm ci --frozen-lockfile

# Install Lyra dashboard dependencies
WORKDIR /app/agents/lyra/dashboard
RUN npm ci --frozen-lockfile

# =====================================================
# Stage 2: Build Application
# =====================================================
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/agents/lyra/dashboard/node_modules ./agents/lyra/dashboard/node_modules

# Copy source code
COPY . .

# Build Lyra dashboard
WORKDIR /app/agents/lyra/dashboard
RUN npm run build

# Build main application (if needed)
WORKDIR /app
RUN npm run build 2>/dev/null || echo "No build script found, skipping..."

# =====================================================
# Stage 3: Production Runtime
# =====================================================
FROM node:18-alpine AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    git \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S flashfusion && \
    adduser -S flashfusion -u 1001

# Copy production dependencies
COPY --from=deps --chown=flashfusion:flashfusion /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=flashfusion:flashfusion /app ./

# Create necessary directories with proper permissions
RUN mkdir -p \
    src/orchestration/data/contexts \
    src/orchestration/data/workflows \
    src/orchestration/data/metrics \
    logs \
    public \
    && chown -R flashfusion:flashfusion /app

# Copy health check script
COPY --chown=flashfusion:flashfusion scripts/docker-health-check.js ./scripts/

# Switch to non-root user
USER flashfusion

# Expose ports
EXPOSE 3333 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node scripts/docker-health-check.js || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3333
ENV NEXT_TELEMETRY_DISABLED=1

# Start command
CMD ["npm", "start"]

# =====================================================
# Metadata
# =====================================================
LABEL maintainer="FlashFusion Team <team@flashfusion.co>"
LABEL version="2.0.0"
LABEL description="AI-powered business operating system - FlashFusion Unified"
LABEL org.opencontainers.image.title="FlashFusion Unified"
LABEL org.opencontainers.image.description="Transform business ideas into automated revenue streams"
LABEL org.opencontainers.image.version="2.0.0"
LABEL org.opencontainers.image.source="https://github.com/Krosebrook/FlashFusion-Unified"
LABEL org.opencontainers.image.licenses="MIT"