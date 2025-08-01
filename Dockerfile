# =====================================================
# FLASHFUSION DOCKER CONTAINER
# Multi-stage production-ready containerized deployment
# =====================================================

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies and security updates
RUN apk update && apk upgrade && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application (if there are build steps)
RUN npm run build || echo "No build step defined"

# Stage 2: Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install runtime dependencies and security updates
RUN apk update && apk upgrade && \
    apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/*

# Create non-root user with specific UID/GID for security
RUN addgroup -g 1001 -S flashfusion && \
    adduser -S flashfusion -u 1001 -G flashfusion

# Copy package files
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy built application from builder stage
COPY --from=builder --chown=flashfusion:flashfusion /app .

# Remove unnecessary files for security
RUN rm -rf \
    .git \
    .github \
    .gitignore \
    .eslintrc* \
    .prettierrc* \
    *.md \
    docs/ \
    tests/ \
    coverage/ \
    .nyc_output \
    node_modules/.cache

# Create necessary directories with proper permissions
RUN mkdir -p \
    orchestration/data/contexts \
    orchestration/data/workflows \
    orchestration/data/metrics \
    logs \
    tmp && \
    chown -R flashfusion:flashfusion /app && \
    chmod -R 755 /app && \
    chmod -R 700 /app/logs /app/tmp

# Switch to non-root user
USER flashfusion

# Set secure environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    NPM_CONFIG_CACHE=/tmp/.npm \
    NODE_OPTIONS="--max-old-space-size=1024"

# Expose port
EXPOSE 3000

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start command
CMD ["npm", "start"]

# Security labels
LABEL maintainer="FlashFusion Team" \
      version="2.0.0" \
      description="AI-powered digital product orchestration platform" \
      org.opencontainers.image.source="https://github.com/flashfusion/flashfusion" \
      org.opencontainers.image.vendor="FlashFusion" \
      org.opencontainers.image.title="FlashFusion Unified" \
      org.opencontainers.image.description="Secure multi-stage Docker image for FlashFusion" \
      security.non-root="true" \
      security.hardened="true"