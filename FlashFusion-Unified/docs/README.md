# 📚 FlashFusion-Unified Documentation Hub
*Comprehensive AI-Powered Development Documentation*

> **Last Updated**: 2025  
> **Maintained by**: 20-Year Fullstack Development Veterans  
> **Optimized for**: Claude Code CLI + Modern Development Workflows

---

## 🚀 Quick Start Documentation

### Essential Guides (Read First)
| Document | Purpose | Time to Read |
|----------|---------|--------------|
| [**FULLSTACK_SETUP_GUIDE.md**](./FULLSTACK_SETUP_GUIDE.md) | Complete development environment setup | 30 mins |
| [**CLAUDE_CODE_FULLSTACK_WORKFLOW.md**](./CLAUDE_CODE_FULLSTACK_WORKFLOW.md) | AI-powered development workflows | 45 mins |
| [**../CLAUDE.md**](../CLAUDE.md) | Project-specific Claude Code context | 10 mins |

### Instant Development Templates
| Template | Use Case | Time to Deploy |
|----------|----------|----------------|
| [**PROJECT_SPINUP_TEMPLATE.md**](./templates/PROJECT_SPINUP_TEMPLATE.md) | Resume development sessions instantly | 2 mins |
| [**FEATURE_DEVELOPMENT_TEMPLATE.md**](./templates/FEATURE_DEVELOPMENT_TEMPLATE.md) | Structured feature development | 5 mins |

---

## 🏗️ Architecture & Development

### Core Documentation
- **[SETUP.md](./SETUP.md)** - Initial project setup instructions
- **[AUTOMATED_PIPELINE.md](./AUTOMATED_PIPELINE.md)** - CI/CD and automation
- **[SECURITY_FIXES.md](./SECURITY_FIXES.md)** - Security implementations and fixes
- **[MCP_INTEGRATION.md](./MCP_INTEGRATION.md)** - Model Context Protocol integration

### Specialized Guides
- **[IMAGE_GENERATION.md](./IMAGE_GENERATION.md)** - AI image generation setup
- **[USER_RESEARCH_STRATEGY.md](./USER_RESEARCH_STRATEGY.md)** - User research automation
- **[KEY_ROTATION_GUIDE.md](./KEY_ROTATION_GUIDE.md)** - Security key management
- **[GIT_NOTION_WORKFLOW.md](./GIT_NOTION_WORKFLOW.md)** - Git-Notion integration

---

## 🛠️ Development Workflows

### Claude Code CLI Integration

#### Essential Commands Reference
```bash
# Project initialization
claude /init                    # Initialize Claude Code context

# Development workflows
claude /plan [task]             # Strategic planning mode
claude /test [feature]          # Test-driven development
claude /review                  # Code quality review
claude /debug [issue]           # Problem-solving mode

# Session management  
claude --dangerously-skip-permissions  # Skip permission prompts
claude /clear                   # Clear session context
```

#### Custom Project Commands
Located in `.claude/commands/`:
- `debug.md` - Debugging workflow
- `deploy.md` - Deployment checklist
- `feature.md` - Feature development guide
- `review.md` - Code review process

### Development Environment Aliases
```bash
# FlashFusion shortcuts (add to ~/.bashrc or ~/.zshrc)
alias ff='cd ~/FlashFusion-Unified/FlashFusion-Unified'
alias ffdev='ff && npm run dev'
alias fftest='ff && npm test'
alias ffbuild='ff && npm run build'

# Claude Code shortcuts
alias cc='claude --dangerously-skip-permissions'
alias ccplan='claude /plan'
alias cctest='claude /test'
alias ccreview='claude /review'
```

---

## 📊 Project Structure Overview

### Directory Organization
```
FlashFusion-Unified/
├── 📋 package.json                     # Root dependencies & scripts
├── 🏗️ FlashFusion-Unified/             # Main application
│   ├── 🎨 client/                      # React frontend
│   │   ├── src/components/             # Reusable components
│   │   ├── src/pages/                  # Page components
│   │   └── src/services/               # API integration
│   ├── 🔧 api/                         # Express.js backend
│   │   ├── main.js                     # Primary API entry
│   │   └── webhooks/                   # External integrations
│   ├── ⚡ functions/                   # Firebase/Serverless functions
│   ├── 🧠 src/                         # Core business logic
│   │   ├── core/                       # Core orchestration
│   │   ├── agents/                     # AI agent implementations
│   │   ├── services/                   # Business services
│   │   └── orchestration/              # Agent coordination
│   ├── 💾 database/                    # Database schemas & migrations
│   ├── 🧪 tests/                       # Test suites
│   ├── 🔧 scripts/                     # Utility scripts
│   └── 📚 docs/                        # This documentation
├── 📊 monitoring/                      # System monitoring tools
└── 🔗 mcp-servers/                     # MCP server implementations
```

### Key Configuration Files
- **package.json** - Project dependencies and scripts
- **CLAUDE.md** - Claude Code project context
- **.claude/** - Claude Code custom commands
- **docker-compose.yml** - Container orchestration
- **vercel.json** - Deployment configuration
- **biome.json** - Code formatting standards

---

## 🔄 Development Workflows

### Daily Development Routine

#### 1. Session Start (5 minutes)
```bash
# Navigate to project
ff

# Check system status
npm run health

# Start development environment
npm run dev

# Start Claude Code session
cc

# Load current context
# Paste PROJECT_SPINUP_TEMPLATE.md content
```

#### 2. Development Session (2-4 hours)
```bash
# Follow Research → Plan → Implement → Test pattern
claude /plan "implement user authentication system"
claude /test "create comprehensive auth test suite"
claude "implement auth service following TDD approach"
claude /review "security review of authentication code"
```

#### 3. Session End (5 minutes)
```bash
# Quality checks
npm run lint
npm run test
npm run build

# Update documentation
# Copy updated PROJECT_SPINUP_TEMPLATE.md

# Commit changes
git add .
git commit -m "feat: implement user authentication

- Add JWT token handling
- Implement password hashing with bcrypt
- Create comprehensive test suite
- Add security middleware

🤖 Generated with Claude Code"

# Clear Claude session
claude /clear
```

### Feature Development Workflow

#### Phase 1: Research & Planning
1. Use `FEATURE_DEVELOPMENT_TEMPLATE.md`
2. Claude Code: `/plan "feature-name"`
3. Document architecture decisions
4. Identify dependencies and risks

#### Phase 2: Test-Driven Implementation
1. Claude Code: `/test "feature-name"`
2. Create comprehensive test suite
3. Implement feature incrementally
4. Regular `/review` checkpoints

#### Phase 3: Integration & Polish
1. Integration testing
2. Performance optimization
3. Security review with `/qcheck`
4. Documentation updates

---

## 🚦 Quality Assurance

### Code Quality Standards
- **Formatting**: Biome (configured in `biome.json`)
- **Linting**: ESLint with custom rules
- **Testing**: Jest for unit tests, Cypress for E2E
- **Type Safety**: TypeScript where applicable
- **Security**: Helmet.js, input validation, SQL injection prevention

### Automated Quality Gates
```bash
# Pre-commit hooks
npm run lint              # Code style check
npm run test              # Unit test suite
npm run security-check    # Security vulnerability scan
npm run validate-keys     # API key validation
```

### Review Process
1. **Self Review**: Claude Code `/review` command
2. **Automated Review**: GitHub Actions CI/CD
3. **Peer Review**: Pull request process
4. **Security Review**: Regular security audits

---

## 🔧 Environment Configuration

### Development Environment Variables
Required in `.env`:
```bash
# Core Configuration
NODE_ENV=development
PORT=3001

# AI Services
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...
REDIS_URL=redis://...

# External Services
NOTION_API_KEY=secret_...
SUPABASE_URL=https://...
ZAPIER_WEBHOOK_URL=https://...
```

### Production Environment
- **Hosting**: Vercel (primary), AWS (backup)
- **Database**: Supabase (PostgreSQL) + MongoDB Atlas
- **Caching**: Redis Cloud
- **Monitoring**: Sentry + Custom metrics
- **CDN**: Cloudflare

---

## 📈 Monitoring & Analytics

### System Health Monitoring
```bash
# Health check endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/metrics

# System monitoring
npm run monitor             # Start monitoring dashboard
npm run logs               # View application logs
npm run metrics            # System performance metrics
```

### Key Performance Indicators
- **Response Times**: < 200ms for API endpoints
- **Error Rates**: < 1% for critical endpoints
- **Test Coverage**: > 80% for all modules
- **Build Times**: < 5 minutes for full deployment
- **Security Score**: A+ rating on security headers

---

## 🚀 Deployment & Operations

### Deployment Checklist
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Rollback plan prepared

### Deployment Commands
```bash
# Development deployment
npm run deploy:dev

# Staging deployment  
npm run deploy:staging

# Production deployment
npm run deploy:prod

# Database migrations
npm run db:migrate

# Health verification
npm run verify:deployment
```

---

## 🤝 Team Collaboration

### Shared Resources
- **Commands**: `.claude/commands/` (version controlled)
- **Templates**: `docs/templates/` (team standards)
- **Workflows**: Documented processes
- **Knowledge Base**: Centralized in this documentation

### Communication Standards
- **Daily Standups**: Progress updates using templates
- **Code Reviews**: Standardized review process
- **Documentation**: Keep docs updated with changes
- **Knowledge Sharing**: Regular team learning sessions

---

## 🆘 Troubleshooting

### Common Issues

#### Claude Code CLI Issues
```bash
# Reset Claude configuration
rm -rf ~/.claude/
claude auth

# Permission issues
claude --dangerously-skip-permissions

# Context limit reached
claude /clear
```

#### Development Environment Issues
```bash
# Port conflicts
lsof -i :3000 :3001
kill -9 <PID>

# Node modules issues
rm -rf node_modules package-lock.json
npm install

# Database connection issues
npm run db:status
npm run health
```

#### Performance Issues
```bash
# Memory issues
node --max-old-space-size=4096 api/main.js

# Debug mode
DEBUG=* npm run dev

# Performance profiling
npm run test:performance
```

### Support Resources
- **Internal Documentation**: This repository
- **Claude Code Docs**: [Anthropic Documentation](https://docs.anthropic.com)
- **Community**: GitHub Discussions
- **Emergency Contacts**: See project README

---

## 📋 Quick Reference Cards

### Essential Commands
```bash
# Project navigation
ff                          # Go to FlashFusion root
ffdev                       # Start development server
fftest                      # Run test suite

# Claude Code
cc                          # Start Claude session  
ccplan                      # Planning mode
cctest                      # TDD mode
ccreview                    # Code review

# Development
npm run dev                 # Start full stack
npm run test:watch          # Watch tests
npm run lint:fix           # Fix linting issues
```

### File Locations
- **Main Config**: `FlashFusion-Unified/CLAUDE.md`
- **Environment**: `FlashFusion-Unified/.env`
- **Commands**: `FlashFusion-Unified/.claude/commands/`
- **Templates**: `FlashFusion-Unified/docs/templates/`
- **Scripts**: `FlashFusion-Unified/scripts/`

---

## 🎯 Next Steps

### For New Team Members
1. Read [FULLSTACK_SETUP_GUIDE.md](./FULLSTACK_SETUP_GUIDE.md)
2. Complete environment setup
3. Run through [CLAUDE_CODE_FULLSTACK_WORKFLOW.md](./CLAUDE_CODE_FULLSTACK_WORKFLOW.md)
4. Use templates for first feature

### For Ongoing Development
1. Follow daily development routine
2. Use feature development templates
3. Maintain documentation updates
4. Regular quality reviews

### For System Evolution
1. Monitor performance metrics
2. Update documentation as system evolves
3. Share best practices with team
4. Continuously improve workflows

---

*🤖 This documentation is optimized for AI-assisted development with Claude Code CLI and represents best practices from experienced fullstack developers working with cutting-edge AI tools.*