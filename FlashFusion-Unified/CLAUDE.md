# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlashFusion Unified is an AI-powered business operating system that transforms business ideas into automated revenue streams. The system uses multiple AI agents to automate development, commerce, and content workflows from a single platform.

### Core Architecture

- **Multi-Agent System**: 6 core AI agents (Researcher, Creator, Optimizer, Automator, Analyzer, Coordinator)
- **Cross-Workflow Intelligence**: Data flows between development, commerce, and content operations
- **Unified Dashboard**: Single interface managing all workflows and agents
- **Integration Hub**: Connects to development tools, e-commerce platforms, and content services

## Development Commands

### Essential Commands
```bash
# Start development server
npm run dev

# Start full development environment (server + client)
npm run dev:full

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Code quality
npm run lint
npm run lint:fix
npm run format

# Build
npm run build

# Deploy to Vercel
npm run deploy
```

### Testing & Validation
```bash
# Security checks
npm run security-check
npm run validate-keys

# Health checks
npm run health

# Test specific components
npm run test-webscraping
npm run test-deployment
```

### Agent & Workflow Management
```bash
# Create new workflow
npm run workflow:create --type=hybrid --name="workflow-name"

# Create new agent
npm run agent:create

# MCP demo
npm run mcp-demo
```

## Code Architecture

### Core Systems (`src/core/`)
- **FlashFusionCore.js**: Main platform orchestrator
- **AgentOrchestrator.js**: Manages AI agent lifecycle and communication
- **WorkflowEngine.js**: Handles workflow execution and state management
- **mcpServer.js**: Model Context Protocol server implementation

### API Structure (`api/` and `src/api/`)
- **api/main.js**: Primary Vercel function handling all routes
- **src/api/UnifiedDashboard.js**: Dashboard API controller
- **src/api/routes/**: Modular route handlers for different features

### Services (`src/services/`)
- **aiService.js**: AI model integration (Anthropic, OpenAI)
- **database.js**: Database operations and connection management
- **notionService.js**: Notion integration for documentation sync
- **zapierService.js**: Zapier webhook and automation handling

### Agent System (`src/orchestration/`)
- **core/**: Agent communication, context management, performance monitoring
- **data/**: Persistent storage for contexts and workflows
- **agents/**: Individual agent implementations

## Key Integrations

### AI Services
- Anthropic Claude (primary)
- OpenAI GPT models
- Custom agent personalities and prompts

### External Services
- **Notion**: Documentation and knowledge management
- **Zapier**: Workflow automation and webhooks
- **Supabase**: Database and authentication
- **Vercel**: Hosting and serverless functions

### Development Tools
- **MCP (Model Context Protocol)**: Enhanced AI integration
- **Playwright**: Web scraping and automation
- **Bull**: Job queue management
- **Winston**: Logging and monitoring

## Environment Configuration

### Required Environment Variables
```bash
# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Database
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...

# Integrations
NOTION_API_KEY=secret_...
ZAPIER_WEBHOOK_URL=https://...

# Security
JWT_SECRET=your-secret-key
```

### Development Setup
1. Copy `.env.example` to `.env`
2. Configure API keys for required services
3. Run `npm run setup` for initial configuration
4. Use `npm run dev:install` to install all dependencies

## Deployment Architecture

### Vercel Configuration
- **Primary Route**: All traffic routes through `api/main.js`
- **Webhook Routes**: Specialized handlers in `api/webhooks/`
- **Static Assets**: Served from `/public`
- **Function Timeouts**: 10s for main API, 30s for webhooks

### CI/CD Pipeline (`.github/workflows/`)
- **code-quality.yml**: ESLint, TypeScript, Biome checks
- **deploy.yml**: Automated Vercel deployments
- **key-rotation-reminder.yml**: Security maintenance

## Code Style Guidelines

### Formatting (Biome Configuration)
- **Indentation**: 2 spaces
- **Line Width**: 100 characters
- **Quotes**: Double quotes for JavaScript
- **Semicolons**: As needed
- **Trailing Commas**: ES5 style

### TypeScript Usage
- Use TypeScript for new services (see `src/server/services/*.ts`)
- Prefer strict typing with proper interfaces
- Use `@types/node` for Node.js types

### Error Handling
- Use Winston logger for structured logging
- Implement graceful degradation for service failures
- Return appropriate HTTP status codes
- Include error context for debugging

## Testing Strategy

### Test Structure
- **Unit Tests**: `src/**/*.test.js`
- **API Tests**: `api/**/*.test.js`
- **Integration Tests**: `tests/`
- **Coverage**: Excludes config and server files

### Test Commands
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Agent Development

### Creating Custom Agents
1. Use `npm run agent:create` for scaffolding
2. Implement in `src/orchestration/agents/`
3. Register with AgentOrchestrator
4. Add to agent prompt library (`src/agents_legacy/prompts/`)

### Agent Communication
- Use AgentCommunicationSystem for inter-agent messaging
- Context sharing through ContextManager
- Performance tracking via PerformanceMonitor

## Workflow Development

### Workflow Types
- **Development**: Code generation, testing, deployment
- **Commerce**: Product research, listing, customer service
- **Content**: Creation, optimization, distribution
- **Custom**: User-defined agent combinations

### Workflow Engine Features
- State persistence in `src/orchestration/data/workflows/`
- Dynamic role selection based on context
- Cross-workflow data sharing and insights

## Security Considerations

### API Key Management
- Store in environment variables only
- Use `scripts/key-rotation.js` for regular rotation
- Validate keys with `npm run validate-keys`
- Never commit keys to repository

### Input Validation
- Use Joi schemas for request validation
- Sanitize user inputs before AI processing
- Rate limiting on API endpoints
- CORS configuration for allowed origins

## Performance Optimization

### Monitoring
- Winston structured logging to `logs/combined.log`
- Performance metrics via PerformanceMonitor
- Health checks at `/health` endpoint

### Optimization Strategies
- Redis caching for frequent operations
- Database connection pooling
- Lazy loading of heavy services
- Compression middleware for responses

## Troubleshooting

### Common Issues
- **Service Initialization Failures**: Check environment variables and API keys
- **Agent Communication Issues**: Verify MCP server configuration
- **Database Connection**: Ensure Supabase credentials are correct
- **Deployment Failures**: Check Vercel function limits and timeouts

### Debug Commands
```bash
# Check service health
npm run health

# Validate environment
npm run validate

# Test specific integrations
npm run test-webscraping
npm run test-deployment
```

### Log Analysis
- Main logs: `logs/combined.log`
- Server logs: `server.log`
- Development logs: Console output with structured formatting

## UI Design Guidelines (SuperDesign Integration)

When creating UI components:
- Use `.superdesign/design_iterations/` for design files
- Follow workflow: Layout → Theme → Animation → Implementation
- Use Flowbite as base UI library
- Avoid bootstrap-style blue colors
- Implement responsive designs
- Use Google Fonts from approved list
- Save themes as CSS files for reuse

## Critical Change Protection

Claude must not make any major build-critical changes without explicit user approval. The approval system in `.claude/approval-system.js` monitors for:
- Package.json dependency changes
- Build configuration modifications  
- Deployment setting updates
- Database schema changes
- API endpoint modifications
- Security configuration changes
- Environment variable updates

Before making critical changes, Claude will request approval with detailed change descriptions and wait for explicit user confirmation (✅ APPROVED, ❌ DENIED, or 🔄 MODIFY).

## Claude Configuration

The `.claude/` directory contains:
- **preferences.json**: Core preferences and permissions
- **tools.json**: Development tool configurations
- **approval-system.js**: Critical change protection system
- **README.md**: Configuration documentation and guidelines