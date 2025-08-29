# Claude Code Security Policy - FlashFusion Unified

> **Security Classification**: Enterprise Grade  
> **Last Updated**: 2025  
> **Approval Required**: All modifications to this policy

## 🔒 Security-First Development Principles

### Core Security Rules (Non-Negotiable)
1. **Explicit Permissions**: Every operation requires explicit approval
2. **No Auto-Approval**: Human verification required for all file changes
3. **Audit Trail**: All operations logged with timestamps
4. **Least Privilege**: Minimal required permissions only
5. **Session Boundaries**: Clear session start/end with security checkpoints

---

## 🛡️ Permission Framework

### Tier 1: Read-Only Operations (Auto-Approved)
```json
"allowed_without_confirmation": [
  "Read",
  "Grep", 
  "LS",
  "Glob"
]
```
**Risk Level**: Low  
**Justification**: No system modifications possible

### Tier 2: Write Operations (Requires Confirmation)
```json
"requires_explicit_approval": [
  "Write",
  "Edit",
  "MultiEdit",
  "NotebookEdit"
]
```
**Risk Level**: Medium  
**Approval Process**: 
1. Claude presents change summary
2. Human reviews and approves
3. Operation executed with logging
4. Verification step required

### Tier 3: System Operations (Requires Explicit Approval + Justification)
```json
"high_risk_operations": [
  "Bash",
  "Task",
  "WebFetch",
  "WebSearch"
]
```
**Risk Level**: High  
**Approval Process**:
1. Claude provides detailed justification
2. Human reviews command/operation
3. Explicit approval with reasoning
4. Operation executed under monitoring
5. Post-operation verification required

---

## 🔐 Protected Assets

### Sensitive Files (Never Auto-Approve)
```
- .env*                    # Environment variables and secrets
- *.key, *.pem            # Cryptographic keys and certificates
- config/secrets/*        # Configuration secrets
- database/migrations/*   # Database schema changes
- package.json            # Dependency modifications
- docker-compose.yml      # Infrastructure configuration
- vercel.json             # Deployment configuration
- firebase.json           # Firebase project configuration
```

### Protected Directories (Restricted Access)
```
- .git/                   # Version control metadata
- node_modules/           # Dependency code (read-only)
- .claude/                # Claude Code configuration
- database/               # Database files and backups
- scripts/                # Automation and deployment scripts
- functions/              # Serverless function code
```

### Critical System Files (Admin Approval Required)
```
- CLAUDE.md               # Project context and instructions
- .gitignore              # Version control rules
- .github/workflows/*     # CI/CD pipeline configuration
- Dockerfile              # Container configuration
```

---

## 🚨 Security Workflows

### Session Initialization Security Checklist
```bash
# 1. Verify working directory
pwd
# Confirm: /c/FlashFusion-Unified/FlashFusion-Unified

# 2. Check git status
git status
# Confirm: No uncommitted sensitive files

# 3. Verify environment isolation
echo $NODE_ENV
# Confirm: development

# 4. Start Claude with explicit permissions
claude --allowedTools "Read" "Grep" "LS" "Glob"
# NO --dangerously-skip-permissions flag

# 5. Load security-aware context
/security-briefing
```

### Pre-Operation Security Gates

#### Before File Modifications:
1. **Impact Assessment**: What files will be affected?
2. **Backup Verification**: Are current changes backed up?
3. **Scope Validation**: Are we modifying only intended files?
4. **Sensitive Data Check**: Any secrets or credentials involved?
5. **Approval**: Explicit human approval required

#### Before Command Execution:
1. **Command Review**: What exactly will be executed?
2. **Privilege Check**: Does command require elevated permissions?
3. **Side Effect Analysis**: What system changes might occur?
4. **Rollback Plan**: How to undo if something goes wrong?
5. **Monitoring**: How to track execution and results?

### Post-Operation Security Verification
```bash
# 1. Verify intended changes only
git diff

# 2. Check for unintended file modifications
git status

# 3. Scan for accidentally committed secrets
npm run security-scan

# 4. Validate system integrity
npm run health-check

# 5. Update audit log
echo "$(date): [OPERATION] completed successfully" >> .claude/audit.log
```

---

## 🔍 Audit and Monitoring

### Audit Log Requirements
All Claude Code operations must be logged with:
- **Timestamp**: ISO 8601 format
- **Operation Type**: Read/Write/Execute
- **Files Affected**: Full paths
- **Commands Executed**: Complete command with arguments
- **User Approval**: Confirmation that human approved
- **Result Status**: Success/Failure/Partial
- **Session ID**: Unique identifier for tracking

### Continuous Monitoring
```bash
# Monitor audit log in real-time
tail -f .claude/audit.log

# Daily security review
npm run security-review

# Weekly audit report
npm run audit-report
```

---

## 🚨 Incident Response

### Security Incident Classifications

#### Level 1: Minor (Information Only)
- Unauthorized file read attempts
- Permission denied operations
- Invalid command attempts

**Response**: Log and continue

#### Level 2: Moderate (Requires Attention)
- Unintended file modifications
- Failed security validations
- Suspicious command patterns

**Response**: 
1. Stop current session
2. Review changes
3. Rollback if necessary
4. Investigate root cause

#### Level 3: Critical (Immediate Action Required)
- Secrets potentially exposed
- System integrity compromised
- Unauthorized external access

**Response**:
1. **STOP ALL OPERATIONS**
2. Disconnect from external services
3. Rotate all API keys/secrets
4. Full system audit
5. Incident report required

### Emergency Procedures
```bash
# 1. Immediate session termination
Ctrl+C
exit

# 2. Check for sensitive data exposure
git log --oneline -10
git diff HEAD~5

# 3. Rotate compromised credentials
npm run rotate-keys

# 4. System integrity check
npm run security-scan
npm run integrity-check

# 5. Document incident
echo "SECURITY INCIDENT: $(date)" >> security-incidents.log
```

---

## 🎯 Secure Development Commands

### Recommended Claude Code Usage
```bash
# Start secure session
claude --allowedTools "Read" "Grep" "LS"

# Expand permissions only when needed
claude --allowedTools "Read" "Grep" "LS" "Edit"

# For system operations (rare)
claude --allowedTools "Read" "Grep" "LS" "Bash(npm run test)"
```

### Security-Validated Workflows

#### Secure File Analysis
```
1. claude --allowedTools "Read" "Grep" "LS"
2. "Please analyze the authentication module"
3. [Claude reads and analyzes]
4. [Human reviews analysis]
5. If changes needed: expand permissions explicitly
```

#### Secure Implementation
```
1. Plan phase: claude --allowedTools "Read" "Grep" "LS"
2. Implementation: claude --allowedTools "Read" "Edit"
3. Testing: claude --allowedTools "Read" "Bash(npm test)"
4. Each phase requires explicit permission expansion
```

---

## 📋 Security Compliance Checklist

### Daily Development Security
- [ ] Session started with minimal permissions
- [ ] All file changes explicitly approved
- [ ] No secrets in git history
- [ ] Audit log reviewed
- [ ] System health verified

### Weekly Security Review
- [ ] Audit logs analyzed for patterns
- [ ] Permission usage reviewed
- [ ] Security incidents assessed
- [ ] Key rotation status checked
- [ ] Team security training current

### Monthly Security Audit
- [ ] Full system security scan
- [ ] Dependency vulnerability check
- [ ] Access control review
- [ ] Incident response testing
- [ ] Security policy updates

---

## ⚖️ Security vs Productivity Balance

### Acceptable Security Trade-offs
- **Read Operations**: Low-friction for code analysis
- **Planned Changes**: Streamlined approval for documented changes
- **Development Scripts**: Pre-approved common operations

### Non-Negotiable Security Requirements
- **Secret Management**: Zero tolerance for exposed credentials
- **External Access**: All external operations require explicit approval
- **System Changes**: Infrastructure changes require formal approval
- **Data Protection**: User data and sensitive business logic protected

---

## 🔧 Implementation Guidelines

### Team Security Standards
1. **All developers** must use explicit permission model
2. **No exceptions** for convenience during development
3. **Security incidents** must be reported immediately
4. **Regular training** on secure AI-assisted development
5. **Tool configuration** standardized across team

### Enforcement Mechanisms
- Configuration files in version control
- Automated security scanning in CI/CD
- Regular security audits
- Incident response procedures
- Team security metrics tracking

---

*🛡️ This security policy ensures enterprise-grade protection while maintaining development efficiency through structured AI collaboration.*