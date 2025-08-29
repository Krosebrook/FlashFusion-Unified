#!/usr/bin/env node
/**
 * Security Audit Script for FlashFusion-Unified
 * Enterprise-grade security validation and monitoring
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class SecurityAuditor {
    constructor() {
        this.auditLog = path.join('.claude', 'audit.log');
        this.securityReport = path.join('security-report.json');
        this.violations = [];
        this.warnings = [];
        this.findings = [];
    }

    /**
     * Main security audit execution
     */
    async runAudit() {
        console.log('🔒 Starting FlashFusion Security Audit...\n');
        
        try {
            await this.checkFilePermissions();
            await this.scanSensitiveFiles();
            await this.auditDependencies();
            await this.validateConfiguration();
            await this.checkGitSecurity();
            await this.analyzeAuditLogs();
            await this.generateReport();
            
            console.log('\n✅ Security audit completed successfully');
            return this.exitWithStatus();
        } catch (error) {
            console.error('❌ Security audit failed:', error.message);
            process.exit(1);
        }
    }

    /**
     * Check file permissions for security violations
     */
    async checkFilePermissions() {
        console.log('📋 Checking file permissions...');
        
        const sensitivePatterns = [
            '.env*',
            '*.key',
            '*.pem',
            '*.p12',
            'secrets.*',
            'config/secrets/*'
        ];

        const dangerousPermissions = ['777', '666', '755'];

        try {
            for (const pattern of sensitivePatterns) {
                const files = execSync(`find . -name "${pattern}" 2>/dev/null || true`)
                    .toString().trim().split('\n').filter(Boolean);
                
                for (const file of files) {
                    try {
                        const stats = fs.statSync(file);
                        const permissions = (stats.mode & parseInt('777', 8)).toString(8);
                        
                        if (dangerousPermissions.includes(permissions)) {
                            this.violations.push({
                                type: 'FILE_PERMISSIONS',
                                severity: 'HIGH',
                                file: file,
                                issue: `Insecure permissions: ${permissions}`,
                                recommendation: 'Change permissions to 600 for sensitive files'
                            });
                        }
                    } catch (err) {
                        // File might not exist or be accessible
                    }
                }
            }
            console.log('  ✓ File permissions checked');
        } catch (error) {
            this.warnings.push({
                type: 'FILE_PERMISSION_CHECK',
                message: 'Could not complete file permission audit'
            });
        }
    }

    /**
     * Scan for sensitive data exposure
     */
    async scanSensitiveFiles() {
        console.log('🔍 Scanning for sensitive data exposure...');
        
        const sensitivePatterns = [
            'password\\s*=',
            'api[_-]?key\\s*=',
            'secret\\s*=',
            'token\\s*=',
            'BEGIN\\s+PRIVATE\\s+KEY',
            'ssh-rsa\\s+AAAA',
            '[A-Za-z0-9+/]{40,}={0,2}' // Base64 encoded secrets
        ];

        const filesToScan = [
            'src/**/*.js',
            'src/**/*.ts',
            'api/**/*.js',
            '*.md',
            '*.json',
            '*.yml',
            '*.yaml'
        ];

        try {
            for (const filePattern of filesToScan) {
                const files = execSync(`find . -path "./node_modules" -prune -o -name "${filePattern.split('/').pop()}" -type f -print 2>/dev/null || true`)
                    .toString().trim().split('\n').filter(Boolean);
                
                for (const file of files) {
                    try {
                        const content = fs.readFileSync(file, 'utf8');
                        
                        for (const pattern of sensitivePatterns) {
                            const regex = new RegExp(pattern, 'gi');
                            const matches = content.match(regex);
                            
                            if (matches) {
                                this.violations.push({
                                    type: 'SENSITIVE_DATA_EXPOSURE',
                                    severity: 'CRITICAL',
                                    file: file,
                                    issue: `Potential sensitive data found: ${matches.length} matches`,
                                    recommendation: 'Move sensitive data to environment variables'
                                });
                            }
                        }
                    } catch (err) {
                        // File might not be readable
                    }
                }
            }
            console.log('  ✓ Sensitive data scan completed');
        } catch (error) {
            this.warnings.push({
                type: 'SENSITIVE_DATA_SCAN',
                message: 'Could not complete sensitive data scan'
            });
        }
    }

    /**
     * Audit npm dependencies for vulnerabilities
     */
    async auditDependencies() {
        console.log('📦 Auditing dependencies for vulnerabilities...');
        
        try {
            const auditResult = execSync('npm audit --json 2>/dev/null || echo "{}"')
                .toString().trim();
            
            const audit = JSON.parse(auditResult);
            
            if (audit.metadata && audit.metadata.vulnerabilities) {
                const vulns = audit.metadata.vulnerabilities;
                
                Object.keys(vulns).forEach(severity => {
                    const count = vulns[severity];
                    if (count > 0) {
                        this.findings.push({
                            type: 'DEPENDENCY_VULNERABILITY',
                            severity: severity.toUpperCase(),
                            count: count,
                            recommendation: 'Run npm audit fix to resolve vulnerabilities'
                        });
                    }
                });
            }
            
            console.log('  ✓ Dependency audit completed');
        } catch (error) {
            this.warnings.push({
                type: 'DEPENDENCY_AUDIT',
                message: 'Could not complete dependency vulnerability scan'
            });
        }
    }

    /**
     * Validate security configuration
     */
    async validateConfiguration() {
        console.log('⚙️  Validating security configuration...');
        
        // Check Claude Code security configuration
        const configPath = path.join('.claude', 'config.json');
        
        try {
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                
                // Validate security settings
                if (config.security?.dangerously_skip_permissions === true) {
                    this.violations.push({
                        type: 'SECURITY_CONFIG',
                        severity: 'HIGH',
                        issue: 'dangerously_skip_permissions is enabled',
                        recommendation: 'Set dangerously_skip_permissions to false for security'
                    });
                }
                
                if (!config.security?.require_confirmation) {
                    this.violations.push({
                        type: 'SECURITY_CONFIG',
                        severity: 'MEDIUM',
                        issue: 'require_confirmation is not enabled',
                        recommendation: 'Enable require_confirmation for better security'
                    });
                }
                
                if (!config.audit?.log_all_operations) {
                    this.violations.push({
                        type: 'SECURITY_CONFIG',
                        severity: 'MEDIUM',
                        issue: 'Audit logging is not enabled',
                        recommendation: 'Enable log_all_operations for security auditing'
                    });
                }
            } else {
                this.warnings.push({
                    type: 'SECURITY_CONFIG',
                    message: 'Claude Code security configuration not found'
                });
            }
            
            console.log('  ✓ Configuration validation completed');
        } catch (error) {
            this.warnings.push({
                type: 'CONFIG_VALIDATION',
                message: 'Could not validate security configuration'
            });
        }
    }

    /**
     * Check Git security
     */
    async checkGitSecurity() {
        console.log('📜 Checking Git security...');
        
        try {
            // Check for sensitive files in git history
            const gitFiles = execSync('git ls-files 2>/dev/null || true')
                .toString().trim().split('\n').filter(Boolean);
            
            const sensitiveFiles = gitFiles.filter(file => 
                file.match(/\.(key|pem|p12)$/) || 
                file.startsWith('.env') ||
                file.includes('secret') ||
                file.includes('password')
            );
            
            if (sensitiveFiles.length > 0) {
                this.violations.push({
                    type: 'GIT_SECURITY',
                    severity: 'HIGH',
                    issue: `Sensitive files in git: ${sensitiveFiles.join(', ')}`,
                    recommendation: 'Remove sensitive files from git history and add to .gitignore'
                });
            }
            
            // Check .gitignore for security patterns
            if (fs.existsSync('.gitignore')) {
                const gitignore = fs.readFileSync('.gitignore', 'utf8');
                const requiredPatterns = ['.env*', '*.key', '*.pem', 'secrets/'];
                
                for (const pattern of requiredPatterns) {
                    if (!gitignore.includes(pattern)) {
                        this.warnings.push({
                            type: 'GITIGNORE',
                            message: `Missing .gitignore pattern: ${pattern}`
                        });
                    }
                }
            }
            
            console.log('  ✓ Git security check completed');
        } catch (error) {
            this.warnings.push({
                type: 'GIT_SECURITY',
                message: 'Could not complete git security check'
            });
        }
    }

    /**
     * Analyze audit logs for security events
     */
    async analyzeAuditLogs() {
        console.log('📊 Analyzing audit logs...');
        
        try {
            if (fs.existsSync(this.auditLog)) {
                const logContent = fs.readFileSync(this.auditLog, 'utf8');
                const lines = logContent.split('\n').filter(Boolean);
                
                // Analyze recent security events
                const securityEvents = lines.filter(line => 
                    line.includes('VIOLATION') || 
                    line.includes('DENIED') || 
                    line.includes('CRITICAL')
                );
                
                if (securityEvents.length > 0) {
                    this.findings.push({
                        type: 'AUDIT_LOG_ANALYSIS',
                        severity: 'MEDIUM',
                        count: securityEvents.length,
                        issue: 'Security events found in audit log',
                        recommendation: 'Review security events and investigate patterns'
                    });
                }
                
                // Check for permission escalation attempts
                const escalationAttempts = lines.filter(line => 
                    line.includes('dangerously-skip-permissions') ||
                    line.includes('allowedTools') && line.includes('*')
                );
                
                if (escalationAttempts.length > 0) {
                    this.violations.push({
                        type: 'PERMISSION_ESCALATION',
                        severity: 'HIGH',
                        count: escalationAttempts.length,
                        issue: 'Permission escalation attempts detected',
                        recommendation: 'Review and restrict permission escalation attempts'
                    });
                }
            }
            
            console.log('  ✓ Audit log analysis completed');
        } catch (error) {
            this.warnings.push({
                type: 'AUDIT_LOG_ANALYSIS',
                message: 'Could not analyze audit logs'
            });
        }
    }

    /**
     * Generate comprehensive security report
     */
    async generateReport() {
        console.log('📋 Generating security report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                violations: this.violations.length,
                warnings: this.warnings.length,
                findings: this.findings.length,
                overallStatus: this.getOverallStatus()
            },
            violations: this.violations,
            warnings: this.warnings,
            findings: this.findings,
            recommendations: this.generateRecommendations()
        };
        
        fs.writeFileSync(this.securityReport, JSON.stringify(report, null, 2));
        console.log(`  ✓ Security report saved to ${this.securityReport}`);
    }

    /**
     * Determine overall security status
     */
    getOverallStatus() {
        const criticalCount = this.violations.filter(v => v.severity === 'CRITICAL').length;
        const highCount = this.violations.filter(v => v.severity === 'HIGH').length;
        
        if (criticalCount > 0) return 'CRITICAL';
        if (highCount > 0) return 'HIGH_RISK';
        if (this.violations.length > 0) return 'MEDIUM_RISK';
        if (this.warnings.length > 0) return 'LOW_RISK';
        return 'SECURE';
    }

    /**
     * Generate security recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.violations.some(v => v.type === 'SENSITIVE_DATA_EXPOSURE')) {
            recommendations.push('Implement secrets management solution');
            recommendations.push('Use environment variables for all sensitive data');
        }
        
        if (this.violations.some(v => v.type === 'FILE_PERMISSIONS')) {
            recommendations.push('Review and fix file permissions for sensitive files');
        }
        
        if (this.violations.some(v => v.type === 'SECURITY_CONFIG')) {
            recommendations.push('Update Claude Code security configuration');
        }
        
        if (this.findings.some(f => f.type === 'DEPENDENCY_VULNERABILITY')) {
            recommendations.push('Update vulnerable dependencies');
        }
        
        return recommendations;
    }

    /**
     * Exit with appropriate status code
     */
    exitWithStatus() {
        const status = this.getOverallStatus();
        
        console.log('\n📊 Security Audit Summary:');
        console.log(`   Status: ${status}`);
        console.log(`   Violations: ${this.violations.length}`);
        console.log(`   Warnings: ${this.warnings.length}`);
        console.log(`   Findings: ${this.findings.length}`);
        
        if (status === 'CRITICAL' || status === 'HIGH_RISK') {
            console.log('\n❌ Security audit failed - critical issues found');
            process.exit(1);
        } else {
            console.log('\n✅ Security audit passed');
            process.exit(0);
        }
    }
}

// Run security audit if called directly
if (require.main === module) {
    const auditor = new SecurityAuditor();
    auditor.runAudit();
}

module.exports = SecurityAuditor;