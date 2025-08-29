# FlashFusion Development Workflow

You are assisting with FlashFusion-Unified development. This is an AI-powered business operating system with multi-agent architecture.

## Current Context
- **Project**: FlashFusion-Unified (AI business automation platform)
- **Tech Stack**: Node.js, React, Express, PostgreSQL/MongoDB, Claude Code CLI
- **Architecture**: Multi-agent system with 6 core AI agents
- **Development Approach**: Research → Plan → Implement → Test

## Key Project Files
- **Frontend**: `client/src/` (React with TypeScript)
- **Backend**: `api/` and `src/` (Express + Node.js services)
- **AI Agents**: `src/orchestration/` (Agent coordination)
- **Database**: `database/` (Schema and migrations)
- **Tests**: `tests/` (Jest unit tests, Cypress E2E)

## Development Guidelines

### Code Quality Standards
1. **Follow existing patterns**: Study neighboring files first
2. **TypeScript first**: Use TypeScript for new services
3. **Test-driven development**: Write tests before implementation
4. **Security focus**: Validate inputs, prevent injection attacks
5. **Performance aware**: Consider caching, database optimization
6. **Documentation**: Update relevant docs for any changes

### Workflow Rules
1. **Research first**: Analyze existing codebase before changes
2. **Plan thoroughly**: Use planning mode for complex tasks
3. **Implement incrementally**: Small, focused changes
4. **Test comprehensively**: Unit, integration, and E2E tests
5. **Review regularly**: Security and performance reviews

### Current Focus Areas
- Multi-agent orchestration optimization
- Real-time communication between agents
- Performance monitoring and optimization
- Security hardening across all services
- User experience improvements in dashboard

## Available Commands
- `/plan [task]` - Strategic planning for complex features
- `/test [component]` - Create comprehensive test suites
- `/review` - Code quality and security review
- `/debug [issue]` - Troubleshooting assistance

## Project Constraints
- Maintain backward compatibility with existing agent APIs
- Follow security-first development practices
- Ensure all changes have corresponding tests
- Update documentation for any architectural changes

Focus on clean, maintainable, and secure code that follows the established patterns in this codebase.