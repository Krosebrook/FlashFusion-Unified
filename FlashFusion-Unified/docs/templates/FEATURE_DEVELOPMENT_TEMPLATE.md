# 🎯 Feature Development Template - Claude Code Optimized

> **Feature**: [FEATURE_NAME]  
> **Epic**: [EPIC_NAME]  
> **Developer**: [YOUR_NAME]  
> **Started**: [DATE]  
> **Target Completion**: [DATE]

## 🎪 Feature Overview

### 🎯 What We're Building
**Feature Name**: [Descriptive name]
**User Story**: As a [user type], I want [functionality] so that [benefit]

### 🎨 Acceptance Criteria
- [ ] [Specific behavior 1]
- [ ] [Specific behavior 2]  
- [ ] [Specific behavior 3]
- [ ] [Performance requirement]
- [ ] [Security requirement]

### 🏗️ Technical Requirements  
- **Frontend**: [React/Vue/Angular components]
- **Backend**: [API endpoints/services]
- **Database**: [Schema changes/migrations]
- **Integration**: [External services/APIs]

---

## 📋 Development Phases

### Phase 1: Research & Planning (Claude Planning Mode)
```
Claude Command: /plan "research and architect [FEATURE_NAME]"
```

#### 🔍 Research Tasks
- [ ] **Existing Code Analysis**
  - [ ] Similar features in codebase
  - [ ] Reusable components/services
  - [ ] Integration points

- [ ] **Technical Design**
  - [ ] Database schema design
  - [ ] API endpoint design  
  - [ ] Component architecture
  - [ ] State management approach

- [ ] **Dependencies & Risks**
  - [ ] External libraries needed
  - [ ] Potential blockers
  - [ ] Performance considerations
  - [ ] Security implications

#### 📊 Research Findings
*[Update after research phase]*

**Architecture Decision**: [Key architectural choice]
**Why**: [Rationale]

**Technology Choices**:
- [Choice 1]: [Reason]
- [Choice 2]: [Reason]

### Phase 2: TDD Setup (Test-First Approach)
```
Claude Command: /test "create comprehensive test suite for [FEATURE_NAME]"
```

#### 🧪 Test Strategy
- [ ] **Unit Tests**
  - [ ] Core business logic
  - [ ] Utility functions
  - [ ] Component functionality

- [ ] **Integration Tests**  
  - [ ] API endpoints
  - [ ] Database operations
  - [ ] Service interactions

- [ ] **E2E Tests**
  - [ ] User workflow scenarios
  - [ ] Edge cases
  - [ ] Error handling

#### Test Files Created
```
tests/
├── unit/
│   ├── [feature]/
│   │   ├── [component].test.js
│   │   └── [service].test.js
├── integration/
│   └── [feature].integration.test.js
└── e2e/
    └── [feature].e2e.test.js
```

### Phase 3: Implementation (Iterative Development)

#### 🏗️ Backend Development
- [ ] **Database Layer**
  - [ ] Migrations/Schema updates
  - [ ] Models/Entities
  - [ ] Repository/DAO layer

- [ ] **Business Logic**
  - [ ] Core services
  - [ ] Validation logic
  - [ ] Error handling

- [ ] **API Layer**
  - [ ] Route definitions
  - [ ] Controller logic
  - [ ] Middleware integration

#### 🎨 Frontend Development  
- [ ] **Components**
  - [ ] Base components
  - [ ] Feature-specific components
  - [ ] Shared utilities

- [ ] **State Management**
  - [ ] State structure
  - [ ] Actions/Reducers
  - [ ] API integration

- [ ] **Styling & UX**
  - [ ] Component styling
  - [ ] Responsive design
  - [ ] Loading states
  - [ ] Error states

### Phase 4: Integration & Polish
- [ ] **Frontend ↔ Backend Integration**
- [ ] **Error Handling & Validation**
- [ ] **Performance Optimization**
- [ ] **Security Review**
- [ ] **Accessibility Compliance**

---

## 🔧 Claude Code Workflow Commands

### Session Management
```bash
# Start feature development session
claude --dangerously-skip-permissions

# Load feature context
"I'm working on [FEATURE_NAME]. Here's the current progress: [BRIEF_UPDATE]"
```

### Development Commands
```
# Planning & Research
/plan "design the architecture for [FEATURE_NAME]"
/research "analyze existing authentication patterns in our codebase"

# Implementation  
/test "create tests for [SPECIFIC_COMPONENT]"
"implement [COMPONENT_NAME] following TDD practices"

# Code Quality
/review "review the [COMPONENT_NAME] implementation"
/qcheck "perform security review of authentication changes"

# Debugging
/debug "investigate issue with [SPECIFIC_PROBLEM]"
```

### Custom Commands for This Feature
Create in `.claude/commands/[feature-name].md`:
```markdown
# [FEATURE_NAME] Development

You are helping develop [FEATURE_NAME]. 

## Context
[Brief description of feature and current status]

## Key Files
- Frontend: `src/components/[feature]/`
- Backend: `src/api/[feature]/`
- Tests: `tests/[feature]/`

## Development Rules
1. Follow TDD approach
2. Maintain existing code patterns
3. Update tests for any changes
4. Ensure security best practices

Focus on incremental progress and clean, maintainable code.
```

---

## 📊 Progress Tracking

### Daily Progress Log
| Date | Hours | Focus Area | Completed | Challenges | Next Steps |
|------|-------|------------|-----------|------------|------------|
| [DATE] | [X.X] | [Area] | [Tasks] | [Issues] | [Plans] |
| [DATE] | [X.X] | [Area] | [Tasks] | [Issues] | [Plans] |

### Development Metrics
- **Lines of Code**: [Added/Modified]
- **Test Coverage**: [Current %] / [Target %]
- **Components Created**: [Count]
- **API Endpoints**: [Count]
- **Database Changes**: [Count]

### Code Review Checklist
- [ ] **Functionality**: Does it work as expected?
- [ ] **Performance**: Are there any bottlenecks?
- [ ] **Security**: Are inputs validated? XSS/SQL injection protected?
- [ ] **Testing**: Good test coverage? Edge cases handled?
- [ ] **Documentation**: Code comments? README updates?
- [ ] **Accessibility**: WCAG compliance? Keyboard navigation?

---

## 🚀 Deployment Preparation

### Pre-Deployment Checklist
- [ ] **All Tests Passing**
  ```bash
  npm test
  npm run test:integration
  npm run test:e2e
  ```

- [ ] **Code Quality Checks**
  ```bash
  npm run lint
  npm run type-check
  npm run security-audit
  ```

- [ ] **Performance Testing**
  ```bash
  npm run test:performance
  npm run analyze-bundle
  ```

- [ ] **Documentation Updates**
  - [ ] API documentation
  - [ ] User documentation  
  - [ ] Technical documentation
  - [ ] CHANGELOG.md

### Deployment Strategy
- [ ] **Staging Deployment**
  - [ ] Deploy to staging environment
  - [ ] Run smoke tests
  - [ ] User acceptance testing

- [ ] **Production Deployment**
  - [ ] Feature flags configured
  - [ ] Database migrations ready
  - [ ] Rollback plan prepared
  - [ ] Monitoring configured

---

## 🎉 Feature Completion

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Tests passing (unit + integration + e2e)
- [ ] Performance requirements met
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Deployed to production
- [ ] Monitoring shows healthy metrics

### Post-Launch Tasks
- [ ] **Monitor Performance**
  - [ ] Check error rates
  - [ ] Monitor response times
  - [ ] Verify user adoption

- [ ] **Gather Feedback**
  - [ ] User feedback collection
  - [ ] Team retrospective
  - [ ] Lessons learned documentation

- [ ] **Technical Debt Assessment**
  - [ ] Identify refactoring opportunities
  - [ ] Plan performance optimizations
  - [ ] Schedule maintenance tasks

---

## 📝 Retrospective Template

### What Went Well
- [Claude Code collaboration highlights]
- [Technical achievements]
- [Process improvements]

### What Could Be Improved
- [Development challenges]
- [Tool/workflow issues]
- [Knowledge gaps identified]

### Action Items for Next Feature
- [ ] [Process improvement]
- [ ] [Tool/setup enhancement]  
- [ ] [Skill development area]

---

## 📚 Feature Documentation

### Technical Documentation
- **Architecture**: [Brief description]
- **Key Components**: [List with responsibilities]
- **API Endpoints**: [List with purposes]
- **Database Schema**: [Changes made]

### User Documentation
- **Feature Guide**: [Link or inline]
- **Troubleshooting**: [Common issues]
- **FAQ**: [Anticipated questions]

### Development Notes
- **Patterns Used**: [Design patterns, architectural decisions]
- **Trade-offs Made**: [What was sacrificed for what benefit]
- **Future Improvements**: [Enhancement opportunities]

---

*🤖 Optimized for Claude Code CLI integration and maximum development efficiency*