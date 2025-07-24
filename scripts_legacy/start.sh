#!/bin/bash

# =====================================================
# FLASHFUSION FULL STACK STARTUP SCRIPT
# Starts FlashFusion with monitoring stack
# =====================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting FlashFusion Full Stack${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Docker is available
if command -v docker >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker available${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Docker not available - starting core services only${NC}"
    DOCKER_AVAILABLE=false
fi

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to start monitoring stack with Docker
start_monitoring_stack() {
    echo -e "\n${CYAN}📊 Starting Monitoring Stack${NC}"
    echo "────────────────────────────────────────────────────"
    
    # Create docker-compose.yml for monitoring stack
    cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: flashfusion-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: flashfusion-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    restart: unless-stopped

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    container_name: flashfusion-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    restart: unless-stopped

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    container_name: flashfusion-kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: flashfusion-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  grafana-data:
  elasticsearch-data:
  redis-data:
EOF

    # Create monitoring config directory
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    
    # Create Prometheus config
    cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'flashfusion-api'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF

    # Create Grafana datasource config
    cat > monitoring/grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

    # Start monitoring stack
    if check_port 9090 && check_port 3001 && check_port 5601; then
        echo -e "${BLUE}Starting monitoring services...${NC}"
        docker-compose -f docker-compose.monitoring.yml up -d
        
        echo -e "${GREEN}✅ Monitoring stack started${NC}"
        echo "  • Prometheus: http://localhost:9090"
        echo "  • Grafana: http://localhost:3001 (admin/admin)"
        echo "  • Kibana: http://localhost:5601"
        echo "  • Redis: localhost:6379"
    else
        echo -e "${YELLOW}⚠️  Some monitoring ports are in use. Skipping monitoring stack.${NC}"
    fi
}

# Function to start core FlashFusion
start_core_services() {
    echo -e "\n${CYAN}🎭 Starting FlashFusion Core${NC}"
    echo "────────────────────────────────────────────────────"
    
    # Check if FlashFusion is already running
    if check_port 3000; then
        echo -e "${BLUE}Installing dependencies...${NC}"
        npm install
        
        echo -e "${BLUE}Running health check...${NC}"
        npm run health || echo "Health check warnings (normal if some services aren't running)"
        
        echo -e "${BLUE}Starting FlashFusion Enhanced Server...${NC}"
        # Start in background
        npm start &
        FLASHFUSION_PID=$!
        
        # Wait for server to start
        echo -n "Waiting for server startup"
        for i in {1..30}; do
            if curl -s http://localhost:3000/health >/dev/null 2>&1; then
                echo -e "\n${GREEN}✅ FlashFusion server started successfully${NC}"
                break
            fi
            echo -n "."
            sleep 1
        done
        
        if ! curl -s http://localhost:3000/health >/dev/null 2>&1; then
            echo -e "\n${RED}❌ Failed to start FlashFusion server${NC}"
            return 1
        fi
        
    else
        echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
        echo "FlashFusion may already be running"
    fi
}

# Function to display dashboard URLs
show_dashboard() {
    echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}🎉 FlashFusion Full Stack Started Successfully!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo -e "\n${CYAN}📊 Access Dashboards:${NC}"
    echo ""
    echo -e "${BLUE}Main API:${NC} http://localhost:3000/docs"
    echo -e "${BLUE}Health Check:${NC} http://localhost:3000/health"
    if $DOCKER_AVAILABLE; then
        echo -e "${BLUE}Grafana Monitoring:${NC} http://localhost:3001 (admin/admin)"
        echo -e "${BLUE}Prometheus Metrics:${NC} http://localhost:9090"
        echo -e "${BLUE}Kibana Logs:${NC} http://localhost:5601"
    fi
    
    echo -e "\n${CYAN}🎯 Immediate Testing Commands:${NC}"
    echo ""
    echo -e "${YELLOW}# Run comprehensive tests${NC}"
    echo "npm test"
    echo ""
    echo -e "${YELLOW}# Check system health${NC}"
    echo "./scripts/health-check.sh"
    echo ""
    echo -e "${YELLOW}# Run performance benchmarks${NC}"
    echo "./scripts/benchmark.sh"
    echo ""
    echo -e "${YELLOW}# View real-time logs${NC}"
    echo "./scripts/dev-utils.sh logs"
    echo ""
    echo -e "${YELLOW}# Reset and reseed data${NC}"
    echo "./scripts/dev-utils.sh reset"
    
    echo -e "\n${CYAN}🔧 Quick API Tests:${NC}"
    echo ""
    echo -e "${YELLOW}# Test health endpoint${NC}"
    echo "curl http://localhost:3000/health"
    echo ""
    echo -e "${YELLOW}# Test authentication${NC}"
    echo 'curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '"'"'{"email":"admin@flashfusion.dev","password":"admin123"}'"'"''
    echo ""
    echo -e "${YELLOW}# Test orchestration${NC}"
    echo "curl http://localhost:3000/api/orchestration/status"
    
    echo -e "\n${GREEN}🚀 System is ready for development!${NC}"
}

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down FlashFusion...${NC}"
    
    if [ ! -z "$FLASHFUSION_PID" ]; then
        kill $FLASHFUSION_PID 2>/dev/null
        echo "FlashFusion server stopped"
    fi
    
    if $DOCKER_AVAILABLE && [ -f "docker-compose.monitoring.yml" ]; then
        echo "Stopping monitoring stack..."
        docker-compose -f docker-compose.monitoring.yml down
    fi
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

# Trap cleanup on script exit
trap cleanup INT TERM

# Main execution
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# Check npm
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm: $(npm --version)${NC}"

# Start services
if $DOCKER_AVAILABLE; then
    start_monitoring_stack
fi

start_core_services

# Show dashboard
show_dashboard

# Keep script running
echo -e "\n${BLUE}Press Ctrl+C to stop all services${NC}"
echo "Monitoring logs... (Ctrl+C to exit)"

# Monitor the main process
if [ ! -z "$FLASHFUSION_PID" ]; then
    wait $FLASHFUSION_PID
else
    # If FlashFusion wasn't started by this script, just wait
    while true; do
        sleep 1
    done
fi