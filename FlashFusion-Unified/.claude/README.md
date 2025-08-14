# Claude Configuration & Best Practices

This directory contains configuration files and systems to ensure Claude Code operates optimally within the FlashFusion-Unified project while maintaining security and code quality standards.

## 📁 Configuration Files

### `preferences.json`
Core preferences defining how Claude should interact with the codebase:
- **Permissions**: Critical change approval requirements
- **Code Style**: Biome + ESLint formatting standards  
- **Development**: Framework and deployment configurations
- **Best Practices**: Security, performance, and quality guidelines
- **Workflows**: Pre-commit and deployment procedures
- **AI Settings**: Agent personalities and communication style

### `tools.json` 
Development tool configurations and usage guidelines:
- **IDE Settings**: Cursor/VSCode configurations
- **Linting**: Biome primary, ESLint fallback
- **Testing**: Jest framework with coverage requirements
- **Deployment**: Vercel serverless configuration
- **AI Providers**: Anthropic (primary), OpenAI (fallback)
- **Integrations**: Database, monitoring, and external services

### `approval-system.js`
JavaScript module implementing critical change approval system:
- **Critical Pattern Detection**: Identifies build-critical files and operations
- **Approval Workflow**: Generates requests and parses user responses
- **Validation**: Ensures proper safeguards for critical changes
- **Logging**: Track approval decisions and changes

## 🔒 Critical Change Protection

The approval system prevents Claude from making build-critical changes without explicit user approval:

### Critical Files Patterns:
- `package.json`, `package-lock.json` (dependencies)
- `webpack.config.*`, `tsconfig.json` (build configs)  
- `vercel.json`, `dockerfile` (deployment)
- `*.env*`, `config/` (environment)
- `routes/`, `api/`, `middleware/` (API endpoints)
- `migrations/`, `schema.sql` (database)

### Critical Operations:
- Dependency installation/removal
- Version updates
- Build script changes
- Deployment configuration
- Database schema changes
- Environment variable changes
- Security policy updates
- API endpoint modifications

## 🛠️ Usage Guidelines

### For Claude Code:
1. **Check File Criticality**: Use `approvalSystem.isCriticalFile(path)` before major changes
2. **Check Operation Criticality**: Use `approvalSystem.isCriticalOperation(description)` for operations
3. **Request Approval**: Generate approval messages for critical changes
4. **Parse Responses**: Check user messages for approval status
5. **Log Changes**: Record all critical change attempts

### For Developers:
1. **Review Requests**: Carefully evaluate critical change requests
2. **Provide Clear Responses**: Use ✅ APPROVED, ❌ DENIED, or 🔄 MODIFY
3. **Add Context**: Include constraints or requirements with approval
4. **Monitor Logs**: Review approval system logs for audit trail

## 📋 Best Practice Guidelines

### Code Quality
- **Formatting**: Use Biome (primary) or ESLint (fallback) 
- **TypeScript**: Preferred for new services and components
- **Testing**: Minimum 80% coverage, Jest framework
- **Documentation**: JSDoc for functions, inline for complex logic
- **Security**: Input validation, no secrets in code, proper error handling

### Development Workflow
1. **Linting**: `npm run lint` before commits
2. **Testing**: `npm test` to verify functionality  
3. **Security**: `npm run security-check` for vulnerabilities
4. **Formatting**: `npm run format` for consistent style
5. **Health**: `npm run health` to verify system status

### Deployment Process
1. **Pre-flight**: Run tests, linting, and security checks
2. **Build Validation**: Ensure build completes successfully
3. **Environment Check**: Verify all required environment variables
4. **Deployment**: Use `npm run deploy` for production
5. **Monitoring**: Check logs and metrics post-deployment

## 🔍 Monitoring & Logging

### System Health
- **Endpoint**: `/health` for system status
- **Command**: `npm run health` for local checks
- **Metrics**: Performance, usage, and error tracking

### Security Monitoring  
- **API Key Validation**: `npm run validate-keys`
- **Security Audit**: `npm run security-check`
- **Vulnerability Scanning**: `npm audit` regularly
- **Log Analysis**: Winston structured logs for security events

### Performance Tracking
- **Analytics**: Vercel Analytics for usage metrics
- **Speed Insights**: Vercel Speed Insights for performance
- **Custom Metrics**: Winston logs for application-specific data

## 🤖 AI Agent Configuration

### Agent Personalities
- **Researcher**: Analytical, thorough, fact-based
- **Creator**: Innovative, creative, solution-oriented
- **Optimizer**: Efficiency-focused, performance-aware  
- **Automator**: Systematic, process-oriented
- **Analyzer**: Detail-oriented, critical-thinking
- **Coordinator**: Collaborative, strategic

### Communication Style
- **Tone**: Professional and concise
- **Verbosity**: Minimal unless detail requested
- **Explanations**: Provided when explicitly asked
- **Error Handling**: Graceful degradation with helpful messages

## 🔗 Integration Points

### Required Services
- **Anthropic Claude**: Primary AI provider
- **Supabase**: Database and authentication
- **Vercel**: Hosting and serverless functions

### Optional Services  
- **Notion**: Documentation synchronization
- **Zapier**: Workflow automation webhooks
- **Firecrawl**: Web scraping capabilities

### Development Tools
- **Cursor IDE**: Primary development environment
- **VSCode**: Backup development environment  
- **GitHub Actions**: CI/CD pipeline automation

## 📚 Additional Resources

- **Main Documentation**: `../CLAUDE.md` - Project overview and commands
- **Package Configuration**: `../package.json` - Scripts and dependencies
- **Code Style**: `../biome.json` - Formatting and linting rules
- **IDE Settings**: `../.vscode/settings.json` - Editor configuration

## 🔄 Updates & Maintenance

This configuration should be updated when:
- New critical file patterns are identified
- Development tools or processes change
- Security requirements evolve
- Performance standards are modified
- Integration points are added or removed

**Last Updated**: 2025-07-26  
**Version**: 1.0.0  
**Maintainer**: FlashFusion Team