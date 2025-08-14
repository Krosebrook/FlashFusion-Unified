#!/bin/bash

# =====================================================
# FLASHFUSION PERFORMANCE BENCHMARK SCRIPT
# Comprehensive performance testing and analysis
# =====================================================

echo "🚀 FlashFusion Performance Benchmark Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
BASE_URL="http://localhost:3000"
CONCURRENT_USERS=10
TEST_DURATION=30
API_ENDPOINTS=(
    "/health"
    "/api/orchestration/status"
    "/auth/login"
)

# Performance thresholds (milliseconds)
EXCELLENT_THRESHOLD=100
GOOD_THRESHOLD=500
ACCEPTABLE_THRESHOLD=1000

# Create results directory
mkdir -p benchmark_results
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="benchmark_results/$TIMESTAMP"
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}📊 Benchmark Configuration${NC}"
echo "────────────────────────────────────────────────────"
echo "Base URL: $BASE_URL"
echo "Concurrent Users: $CONCURRENT_USERS"
echo "Test Duration: ${TEST_DURATION}s"
echo "Results Directory: $RESULTS_DIR"
echo ""

# Function to run a single endpoint test
benchmark_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-""}
    
    echo -e "${CYAN}Testing: $method $endpoint${NC}"
    
    local curl_cmd="curl -s -w '@scripts/curl-format.txt' -o /dev/null"
    
    if [ "$method" = "POST" ] && [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -X POST -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd ${BASE_URL}${endpoint}"
    
    # Run single test to get baseline
    local result=$(eval $curl_cmd 2>/dev/null)
    local response_time=$(echo "$result" | grep "time_total" | awk '{print $2}' | sed 's/,//')
    
    if [ ! -z "$response_time" ]; then
        local response_ms=$(echo "$response_time * 1000" | bc)
        printf "  Response Time: %.0fms" "$response_ms"
        
        if (( $(echo "$response_ms < $EXCELLENT_THRESHOLD" | bc -l) )); then
            echo -e " ${GREEN}(Excellent)${NC}"
        elif (( $(echo "$response_ms < $GOOD_THRESHOLD" | bc -l) )); then
            echo -e " ${YELLOW}(Good)${NC}"
        elif (( $(echo "$response_ms < $ACCEPTABLE_THRESHOLD" | bc -l) )); then
            echo -e " ${YELLOW}(Acceptable)${NC}"
        else
            echo -e " ${RED}(Slow)${NC}"
        fi
        
        # Save result
        echo "$endpoint,$method,$response_ms" >> "$RESULTS_DIR/endpoint_results.csv"
    else
        echo -e "  ${RED}Failed to get response time${NC}"
    fi
}

# Function to run load test
run_load_test() {
    local endpoint=$1
    local concurrent=$2
    local duration=$3
    
    echo -e "${CYAN}Load Testing: $endpoint${NC}"
    echo "  Concurrent Users: $concurrent"
    echo "  Duration: ${duration}s"
    
    # Create curl format file if it doesn't exist
    cat > scripts/curl-format.txt << 'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF

    # Run concurrent requests
    local results_file="$RESULTS_DIR/load_test_${endpoint//\//_}.txt"
    
    for i in $(seq 1 $concurrent); do
        (
            local start_time=$(date +%s)
            local end_time=$((start_time + duration))
            local request_count=0
            
            while [ $(date +%s) -lt $end_time ]; do
                curl -s -w "%{time_total}\n" -o /dev/null "${BASE_URL}${endpoint}" >> "$results_file" 2>/dev/null
                ((request_count++))
                sleep 0.1
            done
            
            echo "Worker $i: $request_count requests" >> "$RESULTS_DIR/worker_stats.txt"
        ) &
    done
    
    # Wait for all workers to complete
    wait
    
    # Analyze results
    if [ -f "$results_file" ]; then
        local total_requests=$(wc -l < "$results_file")
        local avg_time=$(awk '{sum+=$1; count++} END {print sum/count}' "$results_file")
        local avg_ms=$(echo "$avg_time * 1000" | bc)
        local rps=$(echo "scale=2; $total_requests / $duration" | bc)
        
        echo "  Results:"
        printf "    Total Requests: %d\n" "$total_requests"
        printf "    Average Response: %.0fms\n" "$avg_ms"
        printf "    Requests/Second: %.2f\n" "$rps"
        
        # Save summary
        echo "$endpoint,$total_requests,$avg_ms,$rps" >> "$RESULTS_DIR/load_test_summary.csv"
    fi
}

# Function to test memory usage
test_memory_usage() {
    echo -e "${BLUE}🧠 Memory Usage Test${NC}"
    echo "────────────────────────────────────────────────────"
    
    local initial_memory=$(curl -s "$BASE_URL/health" | grep -o '"rss":[0-9]*' | cut -d':' -f2)
    echo "Initial Memory: $(( initial_memory / 1024 / 1024 ))MB"
    
    # Run stress test
    echo "Running memory stress test..."
    for i in {1..100}; do
        curl -s "$BASE_URL/api/orchestration/status" > /dev/null &
    done
    wait
    
    sleep 2
    
    local final_memory=$(curl -s "$BASE_URL/health" | grep -o '"rss":[0-9]*' | cut -d':' -f2)
    echo "Final Memory: $(( final_memory / 1024 / 1024 ))MB"
    
    local memory_diff=$(( final_memory - initial_memory ))
    echo "Memory Increase: $(( memory_diff / 1024 / 1024 ))MB"
    
    if [ $memory_diff -lt 10485760 ]; then  # 10MB
        echo -e "${GREEN}✅ Memory usage stable${NC}"
    else
        echo -e "${YELLOW}⚠️  Significant memory increase detected${NC}"
    fi
}

# Function to test authentication performance
test_auth_performance() {
    echo -e "${BLUE}🔐 Authentication Performance${NC}"
    echo "────────────────────────────────────────────────────"
    
    local auth_data='{"email":"admin@flashfusion.dev","password":"admin123"}'
    
    # Test login performance
    benchmark_endpoint "/auth/login" "POST" "$auth_data"
    
    # Get token for authenticated requests
    local token_response=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "$auth_data")
    
    local token=$(echo "$token_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$token" ]; then
        echo "  Token received, testing authenticated endpoints..."
        
        # Test authenticated endpoint
        local auth_time=$(curl -s -w "%{time_total}" -o /dev/null \
            -H "Authorization: Bearer $token" \
            "$BASE_URL/api/v1/dashboard")
        
        local auth_ms=$(echo "$auth_time * 1000" | bc)
        printf "  Authenticated Request: %.0fms\n" "$auth_ms"
    else
        echo -e "  ${RED}Failed to get authentication token${NC}"
    fi
}

# Initialize benchmark
echo -e "${BLUE}🎯 Starting Benchmark Tests${NC}"
echo "────────────────────────────────────────────────────"

# Create CSV headers
echo "endpoint,method,response_time_ms" > "$RESULTS_DIR/endpoint_results.csv"
echo "endpoint,total_requests,avg_response_ms,requests_per_second" > "$RESULTS_DIR/load_test_summary.csv"

# 1. Basic endpoint tests
echo -e "\n${BLUE}📍 Basic Endpoint Performance${NC}"
echo "────────────────────────────────────────────────────"

for endpoint in "${API_ENDPOINTS[@]}"; do
    if [ "$endpoint" = "/auth/login" ]; then
        benchmark_endpoint "$endpoint" "POST" '{"email":"admin@flashfusion.dev","password":"admin123"}'
    else
        benchmark_endpoint "$endpoint"
    fi
done

# 2. Load testing
echo -e "\n${BLUE}⚡ Load Testing${NC}"
echo "────────────────────────────────────────────────────"

run_load_test "/health" 5 10
run_load_test "/api/orchestration/status" 3 10

# 3. Memory testing
echo -e "\n"
test_memory_usage

# 4. Authentication performance
echo -e "\n"
test_auth_performance

# 5. WebSocket performance (if available)
echo -e "\n${BLUE}🌐 WebSocket Performance${NC}"
echo "────────────────────────────────────────────────────"

if command -v wscat >/dev/null 2>&1; then
    echo "Testing WebSocket connection..."
    timeout 5 wscat -c ws://localhost:3000 -x '{"type":"ping"}' 2>/dev/null && \
        echo -e "${GREEN}✅ WebSocket responsive${NC}" || \
        echo -e "${YELLOW}⚠️  WebSocket test inconclusive${NC}"
else
    echo -e "${YELLOW}⚠️  wscat not available, skipping WebSocket test${NC}"
fi

# Generate final report
echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Benchmark Results Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Analyze endpoint results
if [ -f "$RESULTS_DIR/endpoint_results.csv" ]; then
    echo -e "\n${CYAN}Endpoint Performance:${NC}"
    echo "┌─────────────────────────────────┬──────────────┬──────────┐"
    echo "│ Endpoint                        │ Method       │ Time(ms) │"
    echo "├─────────────────────────────────┼──────────────┼──────────┤"
    
    while IFS=, read -r endpoint method time; do
        if [ "$endpoint" != "endpoint" ]; then  # Skip header
            printf "│ %-31s │ %-12s │ %8.0f │\n" "$endpoint" "$method" "$time"
        fi
    done < "$RESULTS_DIR/endpoint_results.csv"
    
    echo "└─────────────────────────────────┴──────────────┴──────────┘"
fi

# Performance recommendations
echo -e "\n${CYAN}Performance Analysis:${NC}"

avg_response=$(awk -F, 'NR>1 {sum+=$3; count++} END {print sum/count}' "$RESULTS_DIR/endpoint_results.csv" 2>/dev/null)

if [ ! -z "$avg_response" ]; then
    printf "Average Response Time: %.0fms\n" "$avg_response"
    
    if (( $(echo "$avg_response < $EXCELLENT_THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}🚀 Excellent performance! System is highly optimized.${NC}"
    elif (( $(echo "$avg_response < $GOOD_THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}✅ Good performance! System is well optimized.${NC}"
    elif (( $(echo "$avg_response < $ACCEPTABLE_THRESHOLD" | bc -l) )); then
        echo -e "${YELLOW}⚠️  Acceptable performance. Consider optimization.${NC}"
        echo "Recommendations:"
        echo "  • Enable caching for frequently accessed data"
        echo "  • Optimize database queries"
        echo "  • Consider adding a CDN for static assets"
    else
        echo -e "${RED}❌ Performance needs improvement.${NC}"
        echo "Critical recommendations:"
        echo "  • Review application architecture"
        echo "  • Implement database indexing"
        echo "  • Add request caching"
        echo "  • Consider horizontal scaling"
    fi
fi

echo -e "\n${CYAN}Results saved to: $RESULTS_DIR${NC}"
echo "  • endpoint_results.csv     - Individual endpoint performance"
echo "  • load_test_summary.csv    - Load testing results"
echo "  • worker_stats.txt         - Concurrent worker statistics"

echo -e "\n${BLUE}🔗 Monitor live performance:${NC}"
echo "  • Grafana: http://localhost:3001"
echo "  • Prometheus: http://localhost:9090"
echo "  • System Health: curl http://localhost:3000/health"

echo -e "\n${GREEN}🎯 Benchmark complete!${NC}"