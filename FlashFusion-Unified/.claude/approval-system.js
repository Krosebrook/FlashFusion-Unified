/**
 * Critical Change Approval System for Claude
 * Ensures no major build-critical changes are made without user approval
 */

class ApprovalSystem {
    constructor() {
        this.criticalPatterns = [
            // Package management
            /package\.json/i,
            /package-lock\.json/i,
            /npm-shrinkwrap\.json/i,
            
            // Build configurations
            /webpack\.config/i,
            /vite\.config/i,
            /rollup\.config/i,
            /tsconfig\.json/i,
            /babel\.config/i,
            
            // Deployment
            /vercel\.json/i,
            /netlify\.toml/i,
            /dockerfile/i,
            /docker-compose/i,
            
            // Database
            /migrations?\//i,
            /schema\.sql/i,
            /database\.json/i,
            
            // Environment
            /\.env/i,
            /environment/i,
            /config\//i,
            
            // Security
            /auth/i,
            /security/i,
            /middleware/i,
            
            // API endpoints
            /routes?\//i,
            /api\//i,
            /endpoints/i
        ];
        
        this.criticalOperations = [
            'dependency installation',
            'dependency removal', 
            'version updates',
            'build script changes',
            'deployment configuration',
            'database schema changes',
            'environment variable changes',
            'security policy updates',
            'API endpoint modifications',
            'middleware updates'
        ];
    }

    /**
     * Check if a file path is critical and requires approval
     * @param {string} filePath - The file path to check
     * @returns {boolean} - True if critical, false otherwise
     */
    isCriticalFile(filePath) {
        return this.criticalPatterns.some(pattern => pattern.test(filePath));
    }

    /**
     * Check if an operation is critical and requires approval
     * @param {string} operation - Description of the operation
     * @returns {boolean} - True if critical, false otherwise
     */
    isCriticalOperation(operation) {
        const lowerOp = operation.toLowerCase();
        return this.criticalOperations.some(criticalOp => 
            lowerOp.includes(criticalOp.toLowerCase())
        );
    }

    /**
     * Generate approval request message
     * @param {string} type - Type of change (file/operation)
     * @param {string} target - Target file or operation description
     * @param {string} description - Detailed description of changes
     * @returns {string} - Formatted approval request
     */
    generateApprovalRequest(type, target, description = '') {
        const timestamp = new Date().toISOString();
        
        return `
🚨 CRITICAL CHANGE APPROVAL REQUIRED 🚨

Type: ${type}
Target: ${target}
Description: ${description}
Timestamp: ${timestamp}

This change is classified as build-critical and requires your explicit approval.

Changes may affect:
- System stability
- Build process
- Deployment pipeline
- Security configuration
- Database integrity
- API functionality

Please review carefully and respond with:
✅ APPROVED - Proceed with the change
❌ DENIED - Do not make this change
🔄 MODIFY - Request modifications before proceeding

Additional context or constraints can be provided with your response.
        `.trim();
    }

    /**
     * Log critical change attempt
     * @param {string} type - Type of change
     * @param {string} target - Target of change
     * @param {string} status - approval/denied/pending
     */
    logCriticalChange(type, target, status = 'pending') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            target,
            status,
            source: 'claude-approval-system'
        };
        
        // In a real implementation, this would write to a log file
        console.log('[APPROVAL-SYSTEM]', JSON.stringify(logEntry, null, 2));
    }

    /**
     * Check if user has provided approval in their message
     * @param {string} message - User's message
     * @returns {Object} - Approval status and type
     */
    parseUserApproval(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('approved') || lowerMessage.includes('✅')) {
            return { status: 'approved', type: 'explicit' };
        }
        
        if (lowerMessage.includes('denied') || lowerMessage.includes('❌')) {
            return { status: 'denied', type: 'explicit' };
        }
        
        if (lowerMessage.includes('modify') || lowerMessage.includes('🔄')) {
            return { status: 'modify', type: 'explicit' };
        }
        
        // Check for implicit approval phrases
        const approvalPhrases = [
            'go ahead',
            'proceed',
            'continue',
            'yes, do it',
            'make the change',
            'that\'s fine',
            'sounds good'
        ];
        
        if (approvalPhrases.some(phrase => lowerMessage.includes(phrase))) {
            return { status: 'approved', type: 'implicit' };
        }
        
        return { status: 'pending', type: 'none' };
    }

    /**
     * Validate that critical changes have proper safeguards
     * @param {Object} changeDetails - Details about the proposed change
     * @returns {Object} - Validation results and recommendations
     */
    validateCriticalChange(changeDetails) {
        const validations = {
            hasBackup: false,
            hasTests: false,
            hasRollback: false,
            hasDocumentation: false,
            recommendations: []
        };

        // Check for backup procedures
        if (changeDetails.backupPlan) {
            validations.hasBackup = true;
        } else {
            validations.recommendations.push('Create backup before proceeding');
        }

        // Check for test coverage
        if (changeDetails.testsPlan) {
            validations.hasTests = true;
        } else {
            validations.recommendations.push('Define testing strategy');
        }

        // Check for rollback plan
        if (changeDetails.rollbackPlan) {
            validations.hasRollback = true;
        } else {
            validations.recommendations.push('Prepare rollback procedure');
        }

        // Check for documentation
        if (changeDetails.documentation) {
            validations.hasDocumentation = true;
        } else {
            validations.recommendations.push('Document the changes');
        }

        return validations;
    }
}

// Export for use in Claude Code
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApprovalSystem;
}

// Example usage for Claude
const approvalSystem = new ApprovalSystem();

// Example critical change detection
const exampleUsage = {
    // Check if a file is critical
    checkFile: (filePath) => approvalSystem.isCriticalFile(filePath),
    
    // Check if an operation is critical
    checkOperation: (operation) => approvalSystem.isCriticalOperation(operation),
    
    // Generate approval request
    requestApproval: (type, target, description) => 
        approvalSystem.generateApprovalRequest(type, target, description),
    
    // Parse user response
    parseResponse: (message) => approvalSystem.parseUserApproval(message),
    
    // Log changes
    logChange: (type, target, status) => 
        approvalSystem.logCriticalChange(type, target, status)
};

// Make available globally for Claude Code
if (typeof global !== 'undefined') {
    global.FlashFusionApprovalSystem = exampleUsage;
}