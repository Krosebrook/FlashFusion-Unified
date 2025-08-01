#!/bin/bash

# FlashFusion Long-Horizon Development Environment Setup
# This script sets up the complete microservices architecture for FlashFusion

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists docker; then
        missing_deps+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("docker-compose")
    fi
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists git; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and run this script again."
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

# Create directory structure
create_directory_structure() {
    log_info "Creating directory structure..."
    
    # Microservices directories
    mkdir -p src/services/{agent-service,workflow-service,integration-service,user-service,analytics-service,billing-service}
    
    # Infrastructure directories
    mkdir -p {api-gateway,monitoring,database/{init,migrations,clickhouse},mobile/{ios,android}}
    
    # Documentation directories
    mkdir -p docs/{api,architecture,deployment,mobile}
    
    # Scripts directories
    mkdir -p scripts/{deployment,monitoring,database}
    
    # Kubernetes directories
    mkdir -p k8s/{base,overlays/{development,staging,production}}
    
    log_success "Directory structure created"
}

# Generate environment files
generate_env_files() {
    log_info "Generating environment files..."
    
    # Main .env file
    cat > .env.example << 'EOF'
# FlashFusion Long-Horizon Environment Configuration

# Database Configuration
DATABASE_URL=postgresql://flashfusion:flashfusion_dev@localhost:5432/flashfusion
REDIS_URL=redis://:flashfusion_redis@localhost:6379
CLICKHOUSE_URL=http://localhost:8123
KAFKA_BROKERS=localhost:9092

# AI Service API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Authentication & Security
JWT_SECRET=your_jwt_secret_here_at_least_32_characters_long
BCRYPT_ROUNDS=12

# External Service Integrations
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
NOTION_TOKEN=your_notion_integration_token_here

# Service URLs (for microservices communication)
AGENT_SERVICE_URL=http://localhost:3001
WORKFLOW_SERVICE_URL=http://localhost:3002
INTEGRATION_SERVICE_URL=http://localhost:3003
USER_SERVICE_URL=http://localhost:3004
ANALYTICS_SERVICE_URL=http://localhost:3005
BILLING_SERVICE_URL=http://localhost:3006

# Monitoring & Observability
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3000
JAEGER_URL=http://localhost:16686

# Development Settings
NODE_ENV=development
LOG_LEVEL=debug
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Mobile App Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000

# Email Configuration (Development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EOF

    # Copy to actual .env if it doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env
        log_info "Created .env file from template. Please update with your actual values."
    fi
    
    log_success "Environment files generated"
}

# Setup database initialization scripts
setup_database_init() {
    log_info "Setting up database initialization scripts..."
    
    # PostgreSQL initialization script
    cat > database/init/01-create-databases.sql << 'EOF'
-- Create separate databases for each microservice
CREATE DATABASE agent_db;
CREATE DATABASE workflow_db;
CREATE DATABASE integration_db;
CREATE DATABASE user_db;
CREATE DATABASE billing_db;

-- Create users for each service (in production, use separate users)
CREATE USER agent_service WITH PASSWORD 'agent_service_password';
CREATE USER workflow_service WITH PASSWORD 'workflow_service_password';
CREATE USER integration_service WITH PASSWORD 'integration_service_password';
CREATE USER user_service WITH PASSWORD 'user_service_password';
CREATE USER billing_service WITH PASSWORD 'billing_service_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE agent_db TO agent_service;
GRANT ALL PRIVILEGES ON DATABASE workflow_db TO workflow_service;
GRANT ALL PRIVILEGES ON DATABASE integration_db TO integration_service;
GRANT ALL PRIVILEGES ON DATABASE user_db TO user_service;
GRANT ALL PRIVILEGES ON DATABASE billing_db TO billing_service;

-- Enable necessary extensions
\c agent_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c workflow_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\c integration_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c user_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

\c billing_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

    # ClickHouse initialization script
    mkdir -p database/clickhouse/init
    cat > database/clickhouse/init/01-create-analytics-tables.sql << 'EOF'
-- Analytics database initialization for ClickHouse
CREATE DATABASE IF NOT EXISTS analytics;

-- User events table
CREATE TABLE IF NOT EXISTS analytics.user_events (
    event_id UUID,
    user_id String,
    event_type String,
    event_data String,
    timestamp DateTime,
    session_id String,
    device_type String,
    user_agent String
) ENGINE = MergeTree()
ORDER BY (timestamp, user_id)
PARTITION BY toYYYYMM(timestamp);

-- Agent interactions table
CREATE TABLE IF NOT EXISTS analytics.agent_interactions (
    interaction_id UUID,
    user_id String,
    agent_type String,
    input_text String,
    output_text String,
    processing_time_ms UInt32,
    timestamp DateTime,
    success Boolean
) ENGINE = MergeTree()
ORDER BY (timestamp, user_id)
PARTITION BY toYYYYMM(timestamp);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS analytics.workflow_executions (
    execution_id UUID,
    user_id String,
    workflow_id String,
    workflow_type String,
    status String,
    start_time DateTime,
    end_time DateTime,
    steps_completed UInt32,
    total_steps UInt32,
    error_message String
) ENGINE = MergeTree()
ORDER BY (start_time, user_id)
PARTITION BY toYYYYMM(start_time);

-- System metrics table
CREATE TABLE IF NOT EXISTS analytics.system_metrics (
    metric_name String,
    metric_value Float64,
    timestamp DateTime,
    service_name String,
    instance_id String,
    tags String
) ENGINE = MergeTree()
ORDER BY (timestamp, metric_name)
PARTITION BY toYYYYMM(timestamp);
EOF

    log_success "Database initialization scripts created"
}

# Setup monitoring configuration
setup_monitoring() {
    log_info "Setting up monitoring configuration..."
    
    mkdir -p monitoring/grafana/provisioning/{dashboards,datasources}
    
    # Prometheus configuration
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'agent-service'
    static_configs:
      - targets: ['agent-service:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'workflow-service'
    static_configs:
      - targets: ['workflow-service:3002']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'integration-service'
    static_configs:
      - targets: ['integration-service:3003']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'user-service'
    static_configs:
      - targets: ['user-service:3004']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'analytics-service'
    static_configs:
      - targets: ['analytics-service:3005']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'billing-service'
    static_configs:
      - targets: ['billing-service:3006']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
EOF

    # Grafana datasource configuration
    cat > monitoring/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

    log_success "Monitoring configuration created"
}

# Setup API Gateway configuration
setup_api_gateway() {
    log_info "Setting up API Gateway configuration..."
    
    mkdir -p api-gateway
    
    cat > api-gateway/kong.yml << 'EOF'
_format_version: "3.0"
_transform: true

services:
  - name: agent-service
    url: http://agent-service:3001
    routes:
      - name: agent-routes
        paths:
          - /api/agents
        strip_path: false

  - name: workflow-service
    url: http://workflow-service:3002
    routes:
      - name: workflow-routes
        paths:
          - /api/workflows
        strip_path: false

  - name: integration-service
    url: http://integration-service:3003
    routes:
      - name: integration-routes
        paths:
          - /api/integrations
        strip_path: false

  - name: user-service
    url: http://user-service:3004
    routes:
      - name: user-routes
        paths:
          - /api/users
          - /api/auth
        strip_path: false

  - name: analytics-service
    url: http://analytics-service:3005
    routes:
      - name: analytics-routes
        paths:
          - /api/analytics
        strip_path: false

  - name: billing-service
    url: http://billing-service:3006
    routes:
      - name: billing-routes
        paths:
          - /api/billing
        strip_path: false

plugins:
  - name: cors
    config:
      origins:
        - http://localhost:3000
        - http://localhost:8000
      methods:
        - GET
        - POST
        - PUT
        - DELETE
        - PATCH
        - OPTIONS
      headers:
        - Accept
        - Accept-Version
        - Content-Length
        - Content-MD5
        - Content-Type
        - Date
        - Authorization
        - X-Requested-With
      exposed_headers:
        - X-Auth-Token
      credentials: true
      max_age: 3600

  - name: rate-limiting
    config:
      minute: 100
      hour: 1000
      policy: local
EOF

    log_success "API Gateway configuration created"
}

# Create Kubernetes manifests
create_kubernetes_manifests() {
    log_info "Creating Kubernetes manifests..."
    
    # Base kustomization
    cat > k8s/base/kustomization.yaml << 'EOF'
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - namespace.yaml
  - postgres.yaml
  - redis.yaml
  - kafka.yaml
  - agent-service.yaml
  - workflow-service.yaml
  - integration-service.yaml
  - user-service.yaml
  - analytics-service.yaml
  - billing-service.yaml
  - api-gateway.yaml
  - monitoring.yaml
EOF

    # Namespace
    cat > k8s/base/namespace.yaml << 'EOF'
apiVersion: v1
kind: Namespace
metadata:
  name: flashfusion
  labels:
    name: flashfusion
EOF

    # Development overlay
    mkdir -p k8s/overlays/development
    cat > k8s/overlays/development/kustomization.yaml << 'EOF'
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: flashfusion

bases:
  - ../../base

patchesStrategicMerge:
  - development-patches.yaml

images:
  - name: flashfusion/agent-service
    newTag: development
  - name: flashfusion/workflow-service
    newTag: development
  - name: flashfusion/integration-service
    newTag: development
  - name: flashfusion/user-service
    newTag: development
  - name: flashfusion/analytics-service
    newTag: development
  - name: flashfusion/billing-service
    newTag: development
EOF

    log_success "Kubernetes manifests created"
}

# Install Node.js dependencies for microservices
install_dependencies() {
    log_info "Installing Node.js dependencies for microservices..."
    
    # Install dependencies for each service
    services=("agent-service" "workflow-service" "integration-service" "user-service" "analytics-service" "billing-service")
    
    for service in "${services[@]}"; do
        if [ -f "src/services/$service/package.json" ]; then
            log_info "Installing dependencies for $service..."
            (cd "src/services/$service" && npm install)
        fi
    done
    
    log_success "Dependencies installed for all services"
}

# Create development scripts
create_dev_scripts() {
    log_info "Creating development scripts..."
    
    # Start all services script
    cat > scripts/start-all-services.sh << 'EOF'
#!/bin/bash

# Start all FlashFusion microservices for development

echo "Starting FlashFusion microservices..."

# Start infrastructure services
docker-compose -f docker-compose.microservices.yml up -d postgres redis kafka zookeeper clickhouse prometheus grafana jaeger api-gateway

# Wait for infrastructure to be ready
echo "Waiting for infrastructure services to be ready..."
sleep 30

# Start application services
docker-compose -f docker-compose.microservices.yml up -d agent-service workflow-service integration-service user-service analytics-service billing-service

echo "All services started!"
echo ""
echo "Access points:"
echo "  - API Gateway: http://localhost:8000"
echo "  - Grafana: http://localhost:3000 (admin/flashfusion_grafana)"
echo "  - Prometheus: http://localhost:9090"
echo "  - Jaeger: http://localhost:16686"
echo "  - Adminer: http://localhost:8080"
echo ""
echo "Service endpoints:"
echo "  - Agent Service: http://localhost:3001"
echo "  - Workflow Service: http://localhost:3002"
echo "  - Integration Service: http://localhost:3003"
echo "  - User Service: http://localhost:3004"
echo "  - Analytics Service: http://localhost:3005"
echo "  - Billing Service: http://localhost:3006"
EOF

    # Stop all services script
    cat > scripts/stop-all-services.sh << 'EOF'
#!/bin/bash

echo "Stopping all FlashFusion microservices..."
docker-compose -f docker-compose.microservices.yml down

echo "All services stopped!"
EOF

    # Health check script
    cat > scripts/health-check-all.sh << 'EOF'
#!/bin/bash

# Health check for all services

services=(
    "agent-service:3001"
    "workflow-service:3002"
    "integration-service:3003"
    "user-service:3004"
    "analytics-service:3005"
    "billing-service:3006"
)

echo "Checking health of all services..."
echo ""

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -sf "http://localhost:$port/health" > /dev/null; then
        echo "✅ $name is healthy"
    else
        echo "❌ $name is not responding"
    fi
done

echo ""
echo "Infrastructure services:"

# Check API Gateway
if curl -sf "http://localhost:8001" > /dev/null; then
    echo "✅ API Gateway is healthy"
else
    echo "❌ API Gateway is not responding"
fi

# Check Prometheus
if curl -sf "http://localhost:9090/-/healthy" > /dev/null; then
    echo "✅ Prometheus is healthy"
else
    echo "❌ Prometheus is not responding"
fi

# Check Grafana
if curl -sf "http://localhost:3000/api/health" > /dev/null; then
    echo "✅ Grafana is healthy"
else
    echo "❌ Grafana is not responding"
fi
EOF

    # Make scripts executable
    chmod +x scripts/*.sh
    
    log_success "Development scripts created"
}

# Main setup function
main() {
    echo "🚀 FlashFusion Long-Horizon Development Environment Setup"
    echo "========================================================"
    echo ""
    
    check_prerequisites
    create_directory_structure
    generate_env_files
    setup_database_init
    setup_monitoring
    setup_api_gateway
    create_kubernetes_manifests
    install_dependencies
    create_dev_scripts
    
    echo ""
    log_success "FlashFusion long-horizon development environment setup complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update .env file with your actual API keys and configuration"
    echo "2. Run: docker-compose -f docker-compose.microservices.yml up -d"
    echo "3. Access the services at the URLs shown above"
    echo "4. Start developing your microservices!"
    echo ""
    echo "📚 Documentation:"
    echo "- Long-term roadmap: docs/LONG_TERM_ROADMAP.md"
    echo "- Microservices architecture: src/architecture/microservices/README.md"
    echo "- Mobile development: mobile/README.md"
    echo ""
    echo "🎯 Happy coding! Building the future of AI business automation! 🚀"
}

# Run main function
main "$@"