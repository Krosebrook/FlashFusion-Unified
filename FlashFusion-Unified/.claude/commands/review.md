# Code Review Checklist

Perform comprehensive code review following these standards:

## Security Review
- **Input Validation**: All user inputs properly validated and sanitized
- **SQL Injection**: Database queries use parameterized statements
- **XSS Protection**: Output properly escaped, CSP headers configured
- **Authentication**: JWT tokens properly validated, session management secure
- **Authorization**: Role-based access controls implemented correctly
- **API Security**: Rate limiting, CORS configuration, security headers
- **Secret Management**: No hardcoded secrets, proper environment variable usage

## Code Quality Review
- **SOLID Principles**: Single responsibility, open/closed, dependency inversion
- **DRY Violations**: No unnecessary code duplication
- **Error Handling**: Comprehensive try/catch blocks, graceful error recovery
- **Performance**: Efficient algorithms, proper caching strategies
- **Memory Management**: No memory leaks, proper cleanup of resources
- **TypeScript**: Proper typing, interfaces, and type safety

## Architecture Review
- **Design Patterns**: Appropriate use of established patterns
- **Separation of Concerns**: Clear boundaries between layers
- **Scalability**: Code can handle increased load
- **Maintainability**: Clear structure, well-named functions/variables
- **Testability**: Code is easily testable with good dependency injection

## FlashFusion-Specific Review
- **Agent Communication**: Proper message passing between AI agents
- **State Management**: Consistent state handling across services
- **API Consistency**: RESTful design, consistent response formats
- **Database Design**: Efficient schemas, proper indexing
- **Integration Points**: External API usage, webhook handling

## Testing Review
- **Test Coverage**: Adequate coverage of new functionality
- **Test Quality**: Tests actually verify expected behavior
- **Edge Cases**: Boundary conditions and error scenarios tested
- **Integration Tests**: Services work together correctly
- **E2E Tests**: Critical user workflows covered

## Documentation Review
- **Code Comments**: Complex logic properly documented
- **API Documentation**: Endpoints documented with examples
- **README Updates**: Installation and usage instructions current
- **Architecture Documentation**: Changes to system design documented

## Performance Review
- **Database Queries**: Efficient queries, proper use of indexes
- **API Response Times**: Endpoints respond within acceptable limits
- **Memory Usage**: No excessive memory consumption
- **Bundle Size**: Frontend assets optimized for loading
- **Caching**: Appropriate use of caching strategies

Provide specific feedback on any issues found and suggestions for improvement.