# =====================================================
# FLASHFUSION DOCKER CONTAINER
# Production-ready containerized deployment
# =====================================================

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S flashfusion && \
    adduser -S flashfusion -u 1001

# Create necessary directories
RUN mkdir -p orchestration/data/contexts \
             orchestration/data/workflows \
             orchestration/data/metrics \
             logs && \
    chown -R flashfusion:flashfusion /app

# Switch to non-root user
USER flashfusion

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start command
CMD ["npm", "start"]

# Labels
LABEL maintainer="FlashFusion Team"
LABEL version="1.0.0"
LABEL description="AI-powered digital product orchestration platform"
LABEL org.opencontainers.image.source="https://github.com/flashfusion/flashfusion"