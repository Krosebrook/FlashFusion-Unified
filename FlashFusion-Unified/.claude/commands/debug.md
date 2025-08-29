# Debug Workflow

Help debug the current issue systematically:

## Debugging Process

### 1. Issue Analysis
- Identify the specific problem or error
- Reproduce the issue consistently
- Gather relevant error messages and stack traces
- Check recent changes that might have introduced the issue

### 2. System Health Check
- Verify all services are running (API, database, Redis)
- Check system resources (memory, CPU, disk space)
- Review application logs for warnings or errors
- Test external service connections (Supabase, APIs)

### 3. Code Investigation
Focus debugging on:
- **API Endpoints**: Check request/response flow
- **Database Queries**: Verify queries and connections
- **Agent Communication**: Test inter-agent messaging
- **Authentication**: Verify JWT and session handling
- **External Integrations**: Check API keys and endpoints

### 4. Diagnostic Commands
Run these commands to gather information:
- `npm run health` - System health check
- `npm run logs` - View application logs
- `npm run test` - Run test suite
- `npm run validate-keys` - Check API key configuration

### 5. Common Issue Areas
- **Performance**: Database query optimization, caching issues
- **Memory leaks**: Long-running processes, event listeners
- **API failures**: Rate limiting, authentication, timeouts
- **Database issues**: Connection pooling, query performance
- **Agent coordination**: State management, communication errors

### 6. Solution Strategy
- Implement targeted fixes for root causes
- Add comprehensive error handling
- Create tests to prevent regression
- Update monitoring and logging as needed
- Document the solution for future reference

Provide specific, actionable debugging steps and solutions based on the current issue context.