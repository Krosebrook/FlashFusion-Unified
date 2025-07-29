/**
 * Environment Validation Utility for FlashFusion
 * Provides detailed validation and helpful error messages for deployment
 */

class EnvironmentValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.suggestions = [];
    }

    validate() {
        this.validateProduction();
        this.validateDevelopment();
        this.generateReport();
        
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            suggestions: this.suggestions
        };
    }

    validateProduction() {
        if (process.env.NODE_ENV !== 'production') return;

        // Critical production requirements
        if (!process.env.JWT_SECRET) {
            this.errors.push({
                code: 'JWT_SECRET_MISSING',
                message: 'JWT_SECRET environment variable is required but not configured in production deployment',
                solution: 'Add JWT_SECRET environment variable to production secrets'
            });
        }

        // Database configuration
        if (!process.env.SUPABASE_URL) {
            this.warnings.push({
                code: 'SUPABASE_URL_MISSING',
                message: 'SUPABASE_URL environment variable is missing, preventing database connectivity',
                solution: 'Add SUPABASE_URL environment variable to production secrets',
                impact: 'Database features will be disabled'
            });
        }

        if (!process.env.SUPABASE_ANON_KEY) {
            this.warnings.push({
                code: 'SUPABASE_ANON_KEY_MISSING',
                message: 'SUPABASE_ANON_KEY environment variable is missing, preventing database authentication',
                solution: 'Add SUPABASE_ANON_KEY environment variable to production secrets',
                impact: 'Database features will be disabled'
            });
        }

        // AI Service configuration
        if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
            this.warnings.push({
                code: 'AI_KEYS_MISSING',
                message: 'No AI API keys configured (OPENAI_API_KEY or ANTHROPIC_API_KEY)',
                solution: 'Add at least one AI API key to enable AI features',
                impact: 'AI-powered features will be limited'
            });
        }
    }

    validateDevelopment() {
        if (process.env.NODE_ENV === 'production') return;

        // Development warnings
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            this.suggestions.push({
                code: 'DEV_DATABASE_CONFIG',
                message: 'Database credentials not configured for development',
                solution: 'Configure SUPABASE_URL and SUPABASE_ANON_KEY for full functionality'
            });
        }

        if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
            this.suggestions.push({
                code: 'DEV_AI_CONFIG',
                message: 'AI API keys not configured for development',
                solution: 'Add OPENAI_API_KEY or ANTHROPIC_API_KEY to test AI features'
            });
        }
    }

    generateReport() {
        if (this.errors.length > 0) {
            console.error('\n❌ Environment Validation Errors:');
            this.errors.forEach(error => {
                console.error(`   - ${error.message}`);
                console.error(`     Solution: ${error.solution}`);
            });
        }

        if (this.warnings.length > 0) {
            console.warn('\n⚠️  Environment Warnings:');
            this.warnings.forEach(warning => {
                console.warn(`   - ${warning.message}`);
                console.warn(`     Solution: ${warning.solution}`);
                if (warning.impact) {
                    console.warn(`     Impact: ${warning.impact}`);
                }
            });
        }

        if (this.suggestions.length > 0 && process.env.NODE_ENV !== 'production') {
            console.info('\n💡 Development Suggestions:');
            this.suggestions.forEach(suggestion => {
                console.info(`   - ${suggestion.message}`);
                console.info(`     Solution: ${suggestion.solution}`);
            });
        }

        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('\n✅ Environment validation passed');
        }
    }

    // Static method for quick validation
    static validate() {
        const validator = new EnvironmentValidator();
        return validator.validate();
    }

    // Get deployment readiness status
    static getDeploymentStatus() {
        const validator = new EnvironmentValidator();
        const result = validator.validate();
        
        return {
            ready: result.isValid,
            criticalIssues: result.errors.length,
            issues: result.warnings.length,
            blockers: result.errors.map(e => e.code),
            recommendations: result.warnings.map(w => w.solution)
        };
    }
}

module.exports = EnvironmentValidator;