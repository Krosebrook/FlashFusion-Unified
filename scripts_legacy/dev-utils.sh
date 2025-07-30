#!/bin/bash

# =====================================================
# FLASHFUSION DEVELOPMENT UTILITIES
# Helper script for common development tasks
# =====================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to display help
show_help() {
    echo -e "${BLUE}🔧 FlashFusion Development Utilities${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo -e "${CYAN}Available Commands:${NC}"
    echo "  logs [service]          Show real-time logs"
    echo "  reset                   Reset and reseed data"
    echo "  setup                   Initialize development environment"
    echo "  test [type]             Run tests"
    echo "  clean                   Clean temporary files and caches"
    echo "  backup                  Create system backup"
    echo "  restore <backup>        Restore from backup"
    echo "  monitor                 Start monitoring dashboard"
    echo "  ssl                     Generate SSL certificates"
    echo "  env                     Environment management"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo "  $0 logs api             # Show API server logs"
    echo "  $0 test unit            # Run unit tests"
    echo "  $0 reset                # Reset all data"
    echo "  $0 setup                # Setup development environment"
    echo ""
}

# Function to show real-time logs
show_logs() {
    local service=${1:-"all"}
    
    echo -e "${BLUE}📋 FlashFusion Logs - $service${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    case $service in
        "api"|"server")
            if [ -f "$PROJECT_ROOT/logs/combined.log" ]; then
                echo -e "${GREEN}Following API server logs...${NC}"
                tail -f "$PROJECT_ROOT/logs/combined.log"
            else
                echo -e "${YELLOW}No API logs found. Starting server to generate logs.${NC}"
                cd "$PROJECT_ROOT" && npm start
            fi
            ;;
        "error")
            if [ -f "$PROJECT_ROOT/logs/error.log" ]; then
                echo -e "${RED}Following error logs...${NC}"
                tail -f "$PROJECT_ROOT/logs/error.log"
            else
                echo -e "${GREEN}No error logs found (that's good!)${NC}"
            fi
            ;;
        "all"|*)
            echo -e "${CYAN}Following all logs...${NC}"
            if [ -d "$PROJECT_ROOT/logs" ]; then
                tail -f "$PROJECT_ROOT/logs/*.log" 2>/dev/null || echo "No log files found"
            else
                echo "No logs directory found. Run 'npm start' to generate logs."
            fi
            ;;
    esac
}

# Function to reset and reseed data
reset_data() {
    echo -e "${YELLOW}⚠️  Resetting FlashFusion Data${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    read -p "This will delete all project data. Continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🧹 Cleaning data directories...${NC}"
        
        # Clean orchestration data
        rm -rf "$PROJECT_ROOT/orchestration/data/contexts/*" 2>/dev/null
        rm -rf "$PROJECT_ROOT/orchestration/data/workflows/*" 2>/dev/null
        rm -rf "$PROJECT_ROOT/orchestration/data/metrics/*" 2>/dev/null
        
        # Clean logs
        rm -rf "$PROJECT_ROOT/logs/*" 2>/dev/null
        
        # Recreate directories
        mkdir -p "$PROJECT_ROOT/orchestration/data/contexts"
        mkdir -p "$PROJECT_ROOT/orchestration/data/workflows"
        mkdir -p "$PROJECT_ROOT/orchestration/data/metrics"
        mkdir -p "$PROJECT_ROOT/logs"
        
        echo -e "${GREEN}✅ Data reset complete${NC}"
        
        # Optionally seed with sample data
        read -p "Create sample project data? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}🌱 Creating sample data...${NC}"
            create_sample_data
        fi
    else
        echo -e "${CYAN}Reset cancelled${NC}"
    fi
}

# Function to create sample data
create_sample_data() {
    local sample_project='{
        "projectId": "sample-ecommerce-2024",
        "createdAt": '$(date +%s000)',
        "updatedAt": '$(date +%s000)',
        "project": {
            "name": "AI-Powered E-commerce Platform",
            "description": "A modern e-commerce platform with AI-driven product recommendations",
            "type": "web",
            "priority": 8,
            "budget": "high",
            "timeline": "standard",
            "phase": "design",
            "status": "active",
            "features": ["user-auth", "product-catalog", "ai-recommendations", "payment-gateway"]
        },
        "agents": {},
        "history": [],
        "metadata": {
            "version": "1.0",
            "source": "FlashFusion-Sample"
        }
    }'
    
    echo "$sample_project" > "$PROJECT_ROOT/orchestration/data/contexts/sample-ecommerce-2024.json"
    
    local sample_workflow='{
        "projectId": "sample-ecommerce-2024",
        "createdAt": '$(date +%s000)',
        "updatedAt": '$(date +%s000)',
        "currentPhase": "design",
        "phases": {
            "discovery": {
                "market_research": "completed",
                "strategy": "completed",
                "vision": "completed",
                "requirements": "completed"
            },
            "design": {
                "user_research": "completed",
                "wireframes": "in_progress",
                "visual_design": "pending",
                "design_system": "pending"
            }
        },
        "progress": {
            "overall": 30,
            "byPhase": {
                "discovery": 100,
                "design": 25,
                "development": 0
            }
        },
        "timeline": {
            "started": '$(date +%s000)',
            "milestones": []
        }
    }'
    
    echo "$sample_workflow" > "$PROJECT_ROOT/orchestration/data/workflows/sample-ecommerce-2024.json"
    
    echo -e "${GREEN}✅ Sample project created: sample-ecommerce-2024${NC}"
}

# Function to setup development environment
setup_dev() {
    echo -e "${BLUE}🛠️  Setting up FlashFusion Development Environment${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$PROJECT_ROOT"
    
    # Check Node.js version
    echo -e "${CYAN}Checking Node.js version...${NC}"
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        echo "Node.js version: $node_version"
    else
        echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
        exit 1
    fi
    
    # Install dependencies
    echo -e "${CYAN}Installing dependencies...${NC}"
    npm install
    
    # Create required directories
    echo -e "${CYAN}Creating directories...${NC}"
    mkdir -p logs
    mkdir -p orchestration/data/contexts
    mkdir -p orchestration/data/workflows
    mkdir -p orchestration/data/metrics
    mkdir -p benchmark_results
    
    # Make scripts executable
    echo -e "${CYAN}Setting script permissions...${NC}"
    chmod +x scripts/*.sh
    
    # Check environment file
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  .env file not found${NC}"
        read -p "Create default .env file? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .env.example .env 2>/dev/null || cat > .env << 'EOF'
# FlashFusion Environment Configuration
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-change-in-production

# API Keys (add your actual keys)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional services
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgresql://localhost:5432/flashfusion

# Monitoring
LOG_LEVEL=info
EOF
            echo -e "${GREEN}✅ Default .env file created${NC}"
            echo -e "${YELLOW}⚠️  Please update .env with your actual API keys${NC}"
        fi
    else
        echo -e "${GREEN}✅ .env file exists${NC}"
    fi
    
    # Test installation
    echo -e "${CYAN}Testing installation...${NC}"
    if npm run health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check warnings (this is normal if services aren't running)${NC}"
    fi
    
    echo -e "${GREEN}🎉 Development environment setup complete!${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "  1. Update .env with your API keys"
    echo "  2. Run: npm start"
    echo "  3. Visit: http://localhost:3000/docs"
    echo "  4. Run: ./scripts/health-check.sh"
}

# Function to run tests
run_tests() {
    local test_type=${1:-"all"}
    
    echo -e "${BLUE}🧪 Running FlashFusion Tests - $test_type${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$PROJECT_ROOT"
    
    case $test_type in
        "unit")
            echo -e "${CYAN}Running unit tests...${NC}"
            npm test
            ;;
        "integration")
            echo -e "${CYAN}Running integration tests...${NC}"
            node test_enhanced_server.js
            ;;
        "benchmark")
            echo -e "${CYAN}Running performance benchmarks...${NC}"
            ./scripts/benchmark.sh
            ;;
        "simple")
            echo -e "${CYAN}Running simple health test...${NC}"
            node test_simple_enhanced.js
            ;;
        "all"|*)
            echo -e "${CYAN}Running all tests...${NC}"
            npm test
            echo ""
            node test_simple_enhanced.js
            echo ""
            ./scripts/benchmark.sh
            ;;
    esac
}

# Function to clean temporary files
clean_temp() {
    echo -e "${BLUE}🧹 Cleaning FlashFusion Temporary Files${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$PROJECT_ROOT"
    
    echo -e "${CYAN}Cleaning node_modules...${NC}"
    rm -rf node_modules
    
    echo -e "${CYAN}Cleaning npm cache...${NC}"
    npm cache clean --force
    
    echo -e "${CYAN}Cleaning logs...${NC}"
    rm -rf logs/*
    
    echo -e "${CYAN}Cleaning benchmark results...${NC}"
    rm -rf benchmark_results/*
    
    echo -e "${CYAN}Cleaning temporary files...${NC}"
    find . -name "*.tmp" -delete
    find . -name "*.log" -delete
    find . -name ".DS_Store" -delete
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    echo "Run 'npm install' to reinstall dependencies"
}

# Function to create backup
create_backup() {
    echo -e "${BLUE}💾 Creating FlashFusion Backup${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local backup_name="flashfusion_backup_$(date +%Y%m%d_%H%M%S)"
    local backup_dir="$PROJECT_ROOT/backups/$backup_name"
    
    mkdir -p "$backup_dir"
    
    # Backup configuration
    cp .env "$backup_dir/" 2>/dev/null || echo "No .env file to backup"
    cp package.json "$backup_dir/"
    
    # Backup data
    cp -r orchestration/data "$backup_dir/" 2>/dev/null || mkdir -p "$backup_dir/data"
    
    # Backup logs
    cp -r logs "$backup_dir/" 2>/dev/null || mkdir -p "$backup_dir/logs"
    
    # Create backup info
    cat > "$backup_dir/backup_info.txt" << EOF
FlashFusion Backup
Created: $(date)
Version: $(npm list flashfusion --depth=0 2>/dev/null | grep flashfusion || echo "unknown")
Node.js: $(node --version)
Platform: $(uname -a)
EOF
    
    # Create compressed archive
    cd "$PROJECT_ROOT/backups"
    tar -czf "${backup_name}.tar.gz" "$backup_name"
    rm -rf "$backup_name"
    
    echo -e "${GREEN}✅ Backup created: backups/${backup_name}.tar.gz${NC}"
}

# Function to restore backup
restore_backup() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ Please specify backup file${NC}"
        echo "Available backups:"
        ls -la "$PROJECT_ROOT/backups/"*.tar.gz 2>/dev/null || echo "No backups found"
        return 1
    fi
    
    echo -e "${BLUE}📥 Restoring FlashFusion Backup${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ Backup file not found: $backup_file${NC}"
        return 1
    fi
    
    read -p "This will overwrite current data. Continue? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT"
        
        # Extract backup
        tar -xzf "$backup_file" -C /tmp/
        local backup_name=$(basename "$backup_file" .tar.gz)
        
        # Restore files
        cp "/tmp/$backup_name/.env" . 2>/dev/null || echo "No .env in backup"
        cp -r "/tmp/$backup_name/data" orchestration/ 2>/dev/null || echo "No data in backup"
        cp -r "/tmp/$backup_name/logs" . 2>/dev/null || echo "No logs in backup"
        
        # Cleanup
        rm -rf "/tmp/$backup_name"
        
        echo -e "${GREEN}✅ Backup restored successfully${NC}"
    else
        echo -e "${CYAN}Restore cancelled${NC}"
    fi
}

# Function to start monitoring
start_monitoring() {
    echo -e "${BLUE}📊 Starting FlashFusion Monitoring${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo -e "${CYAN}Available monitoring endpoints:${NC}"
    echo "  • Grafana: http://localhost:3001 (admin/admin)"
    echo "  • Prometheus: http://localhost:9090"
    echo "  • Kibana: http://localhost:5601"
    echo "  • FlashFusion Health: http://localhost:3000/health"
    echo "  • FlashFusion Dashboard: http://localhost:3000/api/v1/dashboard"
    
    echo ""
    echo -e "${YELLOW}💡 Starting basic monitoring tools...${NC}"
    
    # Start simple monitoring loop
    while true; do
        clear
        echo -e "${BLUE}📊 FlashFusion Live Monitoring${NC}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "$(date)"
        echo ""
        
        # Check system health
        if curl -s http://localhost:3000/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ FlashFusion API: Online${NC}"
            
            # Get basic metrics
            local health_data=$(curl -s http://localhost:3000/health)
            echo "Memory: $(echo "$health_data" | grep -o '"rss":[0-9]*' | cut -d':' -f2 | head -1 | awk '{print int($1/1024/1024)"MB"}')"
            echo "Uptime: $(echo "$health_data" | grep -o '"uptime":[0-9.]*' | cut -d':' -f2 | awk '{print int($1)"s"}')"
        else
            echo -e "${RED}❌ FlashFusion API: Offline${NC}"
        fi
        
        echo ""
        echo "Press Ctrl+C to exit monitoring"
        sleep 5
    done
}

# Function to manage environment
manage_env() {
    echo -e "${BLUE}🌍 FlashFusion Environment Management${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ -f ".env" ]; then
        echo -e "${CYAN}Current environment variables:${NC}"
        grep -E "^[A-Z_]+" .env | grep -v "API_KEY\|SECRET\|PASSWORD" | head -10
        echo ""
        
        echo -e "${CYAN}API Keys status:${NC}"
        if grep -q "your_.*_key_here" .env; then
            echo -e "${YELLOW}⚠️  Placeholder API keys detected${NC}"
        else
            echo -e "${GREEN}✅ API keys appear to be configured${NC}"
        fi
    else
        echo -e "${RED}❌ No .env file found${NC}"
        echo "Run: $0 setup"
    fi
}

# Main script logic
case "${1:-help}" in
    "logs")
        show_logs "$2"
        ;;
    "reset")
        reset_data
        ;;
    "setup")
        setup_dev
        ;;
    "test")
        run_tests "$2"
        ;;
    "clean")
        clean_temp
        ;;
    "backup")
        create_backup
        ;;
    "restore")
        restore_backup "$2"
        ;;
    "monitor")
        start_monitoring
        ;;
    "env")
        manage_env
        ;;
    "help"|*)
        show_help
        ;;
esac