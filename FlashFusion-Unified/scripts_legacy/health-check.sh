#!/bin/bash

# =====================================================
# FLASHFUSION HEALTH CHECK SCRIPT
# Comprehensive system health validation
# =====================================================

echo "🔍 FlashFusion System Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service_name... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

# Function to check port availability
check_port() {
    local service_name=$1
    local port=$2
    
    echo -n "Checking $service_name (port $port)... "
    
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✅ Available${NC}"
        return 0
    else
        echo -e "${RED}❌ Unavailable${NC}"
        return 1
    fi
}

# Initialize counters
total_checks=0
passed_checks=0

echo -e "\n${BLUE}📡 Core Services${NC}"
echo "────────────────────────────────────────────────────"

# Check FlashFusion API
if check_service "FlashFusion API" "http://localhost:3000/health"; then
    ((passed_checks++))
fi
((total_checks++))

# Check FlashFusion Enhanced Features
if check_service "Enhanced API v1" "http://localhost:3000/api/v1/dashboard" 401; then
    echo "   (401 expected - authentication required)"
    ((passed_checks++))
fi
((total_checks++))

# Check Legacy API
if check_service "Legacy API" "http://localhost:3000/api/orchestration/status"; then
    ((passed_checks++))
fi
((total_checks++))

echo -e "\n${BLUE}📊 Monitoring Stack${NC}"
echo "────────────────────────────────────────────────────"

# Check Grafana
if check_port "Grafana" 3001; then
    ((passed_checks++))
fi
((total_checks++))

# Check Prometheus
if check_port "Prometheus" 9090; then
    ((passed_checks++))
fi
((total_checks++))

# Check Kibana
if check_port "Kibana" 5601; then
    ((passed_checks++))
fi
((total_checks++))

echo -e "\n${BLUE}🔧 Infrastructure${NC}"
echo "────────────────────────────────────────────────────"

# Check Redis (if configured)
if [ ! -z "$REDIS_URL" ]; then
    if check_port "Redis" 6379; then
        ((passed_checks++))
    fi
    ((total_checks++))
fi

# Check PostgreSQL (if configured)
if check_port "PostgreSQL" 5432; then
    ((passed_checks++))
fi
((total_checks++))

echo -e "\n${BLUE}📁 File System${NC}"
echo "────────────────────────────────────────────────────"

# Check critical directories
directories=("logs" "orchestration/data" "orchestration/data/contexts" "orchestration/data/workflows" "orchestration/data/metrics")

for dir in "${directories[@]}"; do
    echo -n "Checking directory: $dir... "
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ Exists${NC}"
        ((passed_checks++))
    else
        echo -e "${YELLOW}⚠️  Missing (creating)${NC}"
        mkdir -p "$dir"
        ((passed_checks++))
    fi
    ((total_checks++))
done

echo -e "\n${BLUE}🔐 Environment Configuration${NC}"
echo "────────────────────────────────────────────────────"

# Check environment variables
env_vars=("NODE_ENV" "JWT_SECRET")
for var in "${env_vars[@]}"; do
    echo -n "Checking $var... "
    if [ ! -z "${!var}" ]; then
        echo -e "${GREEN}✅ Set${NC}"
        ((passed_checks++))
    else
        echo -e "${YELLOW}⚠️  Not set${NC}"
    fi
    ((total_checks++))
done

# Check API keys
echo -n "Checking API Keys... "
api_key_count=0
if [ ! -z "$OPENAI_API_KEY" ] && [[ "$OPENAI_API_KEY" != *"your_"* ]]; then
    ((api_key_count++))
fi
if [ ! -z "$ANTHROPIC_API_KEY" ] && [[ "$ANTHROPIC_API_KEY" != *"your_"* ]]; then
    ((api_key_count++))
fi

if [ $api_key_count -gt 0 ]; then
    echo -e "${GREEN}✅ $api_key_count configured${NC}"
    ((passed_checks++))
else
    echo -e "${YELLOW}⚠️  No valid API keys found${NC}"
fi
((total_checks++))

echo -e "\n${BLUE}🧪 Functionality Tests${NC}"
echo "────────────────────────────────────────────────────"

# Test authentication
echo -n "Testing authentication... "
auth_response=$(curl -s -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@flashfusion.dev","password":"admin123"}' \
    -w "%{http_code}")

if echo "$auth_response" | grep -q "200"; then
    echo -e "${GREEN}✅ Working${NC}"
    ((passed_checks++))
else
    echo -e "${RED}❌ Failed${NC}"
fi
((total_checks++))

# Test orchestration
echo -n "Testing orchestration... "
if curl -s http://localhost:3000/api/orchestration/status | grep -q "success"; then
    echo -e "${GREEN}✅ Working${NC}"
    ((passed_checks++))
else
    echo -e "${RED}❌ Failed${NC}"
fi
((total_checks++))

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Health Check Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

percentage=$((passed_checks * 100 / total_checks))

if [ $percentage -ge 90 ]; then
    status_color=$GREEN
    status_icon="🎉"
    status_text="EXCELLENT"
elif [ $percentage -ge 75 ]; then
    status_color=$YELLOW
    status_text="GOOD"
    status_icon="✅"
else
    status_color=$RED
    status_text="NEEDS ATTENTION"
    status_icon="⚠️"
fi

echo -e "${status_color}$status_icon System Health: $status_text${NC}"
echo -e "Passed: $passed_checks/$total_checks ($percentage%)"

if [ $percentage -ge 75 ]; then
    echo -e "\n${GREEN}🚀 System is ready for use!${NC}"
    echo "Access points:"
    echo "  • Main API: http://localhost:3000"
    echo "  • API Docs: http://localhost:3000/docs"
    echo "  • Grafana: http://localhost:3001 (admin/admin)"
    echo "  • Prometheus: http://localhost:9090"
    echo "  • Kibana: http://localhost:5601"
else
    echo -e "\n${YELLOW}⚠️  Some issues detected. Check the failures above.${NC}"
fi

echo -e "\n${BLUE}💡 Quick Commands:${NC}"
echo "  npm start              # Start FlashFusion server"
echo "  npm run benchmark      # Run performance tests"
echo "  npm test              # Run test suite"
echo "  npm run cli status    # CLI health check"

exit $((total_checks - passed_checks))