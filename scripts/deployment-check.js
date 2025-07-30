#!/usr/bin/env node

/**
 * FlashFusion Deployment Readiness Check
 * Validates environment and provides deployment status
 */

const EnvironmentValidator = require('../src/utils/environmentValidator');
const databaseService = require('../src/services/database');

class DeploymentChecker {
    async checkDeploymentReadiness() {
        console.log('🚀 FlashFusion Deployment Readiness Check');
        console.log('=' .repeat(50));

        // Environment validation
        const envValidation = EnvironmentValidator.validate();
        
        // Database connectivity test
        console.log('\n🗄️  Testing Database Connection...');
        const dbResult = await databaseService.initialize();
        const dbHealth = await databaseService.healthCheck();

        // Generate deployment report
        this.generateDeploymentReport(envValidation, dbResult, dbHealth);
        
        return {
            ready: envValidation.isValid && this.assessOverallReadiness(envValidation, dbResult),
            environment: envValidation,
            database: { initialized: dbResult, health: dbHealth }
        };
    }

    assessOverallReadiness(envValidation, dbResult) {
        // App is ready if no critical errors exist
        // Database is optional - can run in offline mode
        return envValidation.errors.length === 0;
    }

    generateDeploymentReport(envValidation, dbResult, dbHealth) {
        console.log('\n📊 Deployment Report');
        console.log('─'.repeat(30));

        // Environment Status
        if (envValidation.errors.length === 0) {
            console.log('✅ Environment Configuration: READY');
        } else {
            console.log('❌ Environment Configuration: BLOCKED');
            console.log('   Critical issues must be resolved before deployment');
        }

        // Database Status
        if (dbResult) {
            console.log('✅ Database Connection: CONNECTED');
        } else {
            console.log('⚠️  Database Connection: OFFLINE MODE');
            console.log('   App will run with limited functionality');
        }

        // Overall Status
        const isReady = this.assessOverallReadiness(envValidation, dbResult);
        console.log('\n🎯 Overall Deployment Status:');
        if (isReady) {
            console.log('✅ READY FOR DEPLOYMENT');
            console.log('   Your application is configured and ready to deploy');
            
            if (!dbResult) {
                console.log('\n💡 Optional Improvements:');
                console.log('   - Configure database credentials for full functionality');
                console.log('   - Add AI API keys for enhanced features');
            }
        } else {
            console.log('❌ NOT READY - Action Required');
            console.log('   Resolve critical issues before attempting deployment');
        }

        // Next Steps
        console.log('\n📋 Next Steps:');
        if (envValidation.errors.length > 0) {
            console.log('   1. Fix critical environment issues:');
            envValidation.errors.forEach(error => {
                console.log(`      - ${error.solution}`);
            });
        }
        
        if (envValidation.warnings.length > 0) {
            console.log('   2. Consider addressing warnings:');
            envValidation.warnings.forEach(warning => {
                console.log(`      - ${warning.solution}`);
            });
        }
        
        if (isReady) {
            console.log('   3. Deploy to your platform:');
            console.log('      - Set environment variables in production');
            console.log('      - Run deployment command');
            console.log('      - Monitor application logs');
        }
    }

    // Quick status check
    async quickCheck() {
        const envValidation = EnvironmentValidator.getDeploymentStatus();
        console.log('⚡ Quick Deployment Check');
        console.log(`   Ready: ${envValidation.ready ? '✅' : '❌'}`);
        console.log(`   Critical Issues: ${envValidation.criticalIssues}`);
        console.log(`   Warnings: ${envValidation.issues}`);
        
        if (!envValidation.ready) {
            console.log('   Blockers:', envValidation.blockers.join(', '));
        }
        
        return envValidation;
    }
}

// CLI interface
if (require.main === module) {
    const command = process.argv[2];
    const checker = new DeploymentChecker();
    
    switch (command) {
        case 'quick':
            checker.quickCheck();
            break;
        case 'full':
        default:
            checker.checkDeploymentReadiness().then(result => {
                process.exit(result.ready ? 0 : 1);
            }).catch(error => {
                console.error('❌ Deployment check failed:', error.message);
                process.exit(1);
            });
            break;
    }
}

module.exports = DeploymentChecker;