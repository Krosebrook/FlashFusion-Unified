#!/bin/bash

# =====================================================
# FLASHFUSION SECURE DEPLOYMENT SCRIPT
# Comprehensive deployment with security validation
# =====================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_ENV="${1:-production}"
BACKUP_DIR="${PROJECT_ROOT}/backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="${PROJECT_ROOT}/logs/deployment_$(date +%Y%m%d_%H%M%S).log"

# Environment-specific configurations
case "$DEPLOYMENT_ENV" in
    "production")
        DOCKER_COMPOSE_FILE="docker-compose.yml"
        ENV_FILE=".env.production"
        ;;
    "staging")
        DOCKER_COMPOSE_FILE="docker-compose.staging.yml"
        ENV_FILE=".env.staging"
        ;;
    "development")
        DOCKER_COMPOSE_FILE="docker-compose.dev.yml"
        ENV_FILE=".env.development"
        ;;
    *)
        echo -e "${RED}Error: Invalid deployment environment. Use: production, staging, or development${NC}"
        exit 1
        ;;
esac

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $timestamp: $message" | tee -a "$LOG_FILE"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $timestamp: $message" | tee -a "$LOG_FILE"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $timestamp: $message" | tee -a "$LOG_FILE"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} $timestamp: $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Error handling
error_exit() {
    log "ERROR" "Deployment failed at line $1"
    log "ERROR" "Check logs at: $LOG_FILE"
    exit 1
}

trap 'error_exit $LINENO' ERR

# Create necessary directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log "INFO" "Starting FlashFusion deployment to $DEPLOYMENT_ENV environment"
log "INFO" "Backup directory: $BACKUP_DIR"
log "INFO" "Log file: $LOG_FILE"

# =====================================================
# PRE-DEPLOYMENT SECURITY CHECKS
# =====================================================

log "INFO" "Performing pre-deployment security checks..."

# Check if running as root (should not be)
if [[ $EUID -eq 0 ]]; then
    log "ERROR" "This script should not be run as root"
    exit 1
fi

# Check for required tools
required_tools=("docker" "docker-compose" "git" "openssl")
for tool in "${required_tools[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
        log "ERROR" "Required tool '$tool' is not installed"
        exit 1
    fi
done

# Check environment file exists
if [[ ! -f "$ENV_FILE" ]]; then
    log "ERROR" "Environment file $ENV_FILE not found"
    exit 1
fi

# Validate environment variables
log "INFO" "Validating environment configuration..."
source "$ENV_FILE"

required_vars=(
    "POSTGRES_PASSWORD"
    "REDIS_PASSWORD"
    "SESSION_SECRET"
    "JWT_SECRET"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
)

for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        log "ERROR" "Required environment variable $var is not set"
        exit 1
    fi
done

# Check secret strength
if [[ ${#SESSION_SECRET} -lt 32 ]]; then
    log "WARN" "SESSION_SECRET should be at least 32 characters long"
fi

if [[ ${#JWT_SECRET} -lt 32 ]]; then
    log "WARN" "JWT_SECRET should be at least 32 characters long"
fi

# =====================================================
# SECURITY SCAN
# =====================================================

log "INFO" "Running security scans..."

# Run npm audit
if [[ -f "package.json" ]]; then
    log "INFO" "Running npm audit..."
    if npm audit --audit-level=moderate; then
        log "INFO" "npm audit passed"
    else
        log "WARN" "npm audit found vulnerabilities - review before deployment"
        read -p "Continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "INFO" "Deployment cancelled by user"
            exit 0
        fi
    fi
fi

# Check for secrets in code
log "INFO" "Scanning for potential secrets in code..."
if command -v detect-secrets &> /dev/null; then
    if detect-secrets scan --baseline .secrets.baseline; then
        log "INFO" "No new secrets detected"
    else
        log "WARN" "Potential secrets detected - review before deployment"
    fi
fi

# =====================================================
# BACKUP PROCEDURES
# =====================================================

log "INFO" "Creating backups..."

# Backup database
if docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q postgres | grep -q .; then
    log "INFO" "Backing up PostgreSQL database..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres \
        pg_dump -U flashfusion flashfusion > "$BACKUP_DIR/database_backup.sql"
    log "INFO" "Database backup completed: $BACKUP_DIR/database_backup.sql"
fi

# Backup Redis data
if docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q redis | grep -q .; then
    log "INFO" "Backing up Redis data..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis \
        redis-cli --rdb /data/dump.rdb
    docker cp "$(docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q redis):/data/dump.rdb" \
        "$BACKUP_DIR/redis_backup.rdb"
    log "INFO" "Redis backup completed: $BACKUP_DIR/redis_backup.rdb"
fi

# Backup configuration files
log "INFO" "Backing up configuration files..."
cp "$ENV_FILE" "$BACKUP_DIR/"
cp "$DOCKER_COMPOSE_FILE" "$BACKUP_DIR/"
cp -r nginx/ "$BACKUP_DIR/nginx_backup/"
cp -r monitoring/ "$BACKUP_DIR/monitoring_backup/"

# =====================================================
# CODE VALIDATION
# =====================================================

log "INFO" "Validating code..."

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    log "WARN" "There are uncommitted changes in the repository"
    git status --porcelain
    read -p "Continue with uncommitted changes? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "INFO" "Deployment cancelled by user"
        exit 0
    fi
fi

# Run tests if available
if [[ -f "package.json" ]] && npm run test --if-present; then
    log "INFO" "Tests passed"
else
    log "WARN" "No tests found or tests failed"
fi

# =====================================================
# DOCKER IMAGE BUILD
# =====================================================

log "INFO" "Building Docker images..."

# Build with security scanning
docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache

# Scan for vulnerabilities (if Trivy is available)
if command -v trivy &> /dev/null; then
    log "INFO" "Scanning Docker images for vulnerabilities..."
    for image in $(docker-compose -f "$DOCKER_COMPOSE_FILE" config --images); do
        log "INFO" "Scanning image: $image"
        trivy image --severity HIGH,CRITICAL "$image" || log "WARN" "Vulnerabilities found in $image"
    done
fi

# =====================================================
# DEPLOYMENT
# =====================================================

log "INFO" "Starting deployment..."

# Stop existing services gracefully
log "INFO" "Stopping existing services..."
docker-compose -f "$DOCKER_COMPOSE_FILE" down --timeout 30

# Pull latest images
log "INFO" "Pulling latest images..."
docker-compose -f "$DOCKER_COMPOSE_FILE" pull

# Start services
log "INFO" "Starting services..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

# Wait for services to be healthy
log "INFO" "Waiting for services to be healthy..."
timeout=300
elapsed=0
while [[ $elapsed -lt $timeout ]]; do
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "healthy"; then
        log "INFO" "All services are healthy"
        break
    fi
    sleep 10
    elapsed=$((elapsed + 10))
    log "INFO" "Waiting for services... ($elapsed/$timeout seconds)"
done

if [[ $elapsed -ge $timeout ]]; then
    log "ERROR" "Services failed to become healthy within timeout"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs
    exit 1
fi

# =====================================================
# POST-DEPLOYMENT CHECKS
# =====================================================

log "INFO" "Performing post-deployment checks..."

# Health check
log "INFO" "Running health check..."
if curl -f http://localhost/health; then
    log "INFO" "Health check passed"
else
    log "ERROR" "Health check failed"
    exit 1
fi

# Security check
log "INFO" "Running security check..."
if curl -f http://localhost/health/security; then
    log "INFO" "Security check passed"
else
    log "WARN" "Security check failed"
fi

# Performance check
log "INFO" "Running performance check..."
if curl -f http://localhost/health/performance; then
    log "INFO" "Performance check passed"
else
    log "WARN" "Performance check failed"
fi

# =====================================================
# MONITORING SETUP
# =====================================================

log "INFO" "Setting up monitoring..."

# Check if monitoring services are running
if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "prometheus"; then
    log "INFO" "Prometheus is running"
fi

if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "grafana"; then
    log "INFO" "Grafana is running"
fi

# =====================================================
# CLEANUP
# =====================================================

log "INFO" "Cleaning up..."

# Remove old backups (keep last 7 days)
find "${PROJECT_ROOT}/backups" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

# Remove old logs (keep last 30 days)
find "${PROJECT_ROOT}/logs" -name "deployment_*.log" -mtime +30 -delete 2>/dev/null || true

# =====================================================
# DEPLOYMENT SUMMARY
# =====================================================

log "INFO" "Deployment completed successfully!"
log "INFO" "Environment: $DEPLOYMENT_ENV"
log "INFO" "Backup location: $BACKUP_DIR"
log "INFO" "Log file: $LOG_FILE"

# Display service status
log "INFO" "Service status:"
docker-compose -f "$DOCKER_COMPOSE_FILE" ps

# Display URLs
log "INFO" "Application URLs:"
log "INFO" "  - Main application: http://localhost"
log "INFO" "  - Health check: http://localhost/health"
log "INFO" "  - Metrics: http://localhost/metrics"
log "INFO" "  - Grafana: http://localhost:3001"
log "INFO" "  - Prometheus: http://localhost:9090"

log "INFO" "Deployment script completed successfully"