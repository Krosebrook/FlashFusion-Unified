#!/usr/bin/env node

/**
 * Deployment Test Script
 * Verifies that deployment will work before pushing
 */

const https = require('https');
const http = require('http');

class DeploymentTester {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    async runAllTests() {
        console.log('🧪 FlashFusion Deployment Tests\n');

        // Test 1: Logger Safety
        await this.testLoggerSafety();

        // Test 2: API Function Syntax
        await this.testAPIFunctions();

        // Test 3: Dependencies Check
        await this.testDependencies();

        // Test 4: Environment Variables
        await this.testEnvironmentVariables();

        // Test 5: Vercel Configuration
        await this.testVercelConfig();

        // Generate report
        this.generateReport();
    }

    async testLoggerSafety() {
        console.log('1. Testing Logger Safety...');
        
        try {
            // Test that logger doesn't use file system
            const logger = require('../src/utils/logger.js');
            
            // Verify it's console or our universal logger
            if (logger === console) {
                this.addResult('✅ Logger Safety', 'Using console (safe)');
            } else if (logger.constructor.name === 'UniversalLogger') {
                this.addResult('✅ Logger Safety', 'Using UniversalLogger (safe)');
            } else {
                this.addResult('❌ Logger Safety', 'Unknown logger type');
            }
            
        } catch (error) {
            this.addResult('❌ Logger Safety', `Error: ${error.message}`);
        }
    }

    async testAPIFunctions() {
        console.log('2. Testing API Functions...');
        
        const apiFunctions = [
            'api/bulletproof.js',
            'api/hello.js',
            'api/mcp.js'
        ];

        for (const apiFile of apiFunctions) {
            try {
                // Test syntax by requiring
                const apiFunction = require(`../${apiFile}`);
                
                if (typeof apiFunction === 'function') {
                    this.addResult('✅ API Function', `${apiFile} - Valid`);
                } else {
                    this.addResult('⚠️ API Function', `${apiFile} - Not a function`);
                }
                
            } catch (error) {
                this.addResult('❌ API Function', `${apiFile} - ${error.message}`);
            }
        }
    }

    async testDependencies() {
        console.log('3. Testing Dependencies...');
        
        try {
            const packageJson = require('../package.json');
            const dependencies = Object.keys(packageJson.dependencies || {});
            
            // Check for problematic dependencies
            const problematic = dependencies.filter(dep => 
                dep.includes('winston') && dep !== '@types/winston'
            );
            
            if (problematic.length === 0) {
                this.addResult('✅ Dependencies', 'No Winston dependencies found');
            } else {
                this.addResult('⚠️ Dependencies', `Winston found: ${problematic.join(', ')}`);
            }
            
        } catch (error) {
            this.addResult('❌ Dependencies', `Error: ${error.message}`);
        }
    }

    async testEnvironmentVariables() {
        console.log('4. Testing Environment Variables...');
        
        try {
            require('dotenv').config();
            
            const criticalVars = [
                'OPENAI_API_KEY',
                'ANTHROPIC_API_KEY',
                'SUPABASE_URL'
            ];
            
            let validCount = 0;
            let placeholderCount = 0;
            
            for (const varName of criticalVars) {
                const value = process.env[varName];
                if (value && !value.includes('your_') && !value.includes('_here')) {
                    validCount++;
                } else {
                    placeholderCount++;
                }
            }
            
            if (validCount > 0) {
                this.addResult('✅ Environment', `${validCount} keys configured, ${placeholderCount} placeholders`);
            } else {
                this.addResult('⚠️ Environment', 'No API keys configured');
            }
            
        } catch (error) {
            this.addResult('⚠️ Environment', 'No .env file found');
        }
    }

    async testVercelConfig() {
        console.log('5. Testing Vercel Configuration...');
        
        try {
            const vercelConfig = require('../vercel.json');
            
            // Check if bulletproof function is configured
            const hasFunctions = vercelConfig && 'functions' in vercelConfig && vercelConfig.functions && vercelConfig.functions['api/bulletproof.js'];
            if (hasFunctions) {
                this.addResult('✅ Vercel Config', 'Bulletproof function configured');
            } else {
                this.addResult('⚠️ Vercel Config', 'Bulletproof function not configured');
            }
            
            // Check rewrite rules
            const hasRewrites = vercelConfig && 'rewrites' in vercelConfig && Array.isArray(vercelConfig.rewrites) && vercelConfig.rewrites.length > 0;
            if (hasRewrites) {
                this.addResult('✅ Vercel Config', 'Rewrite rules configured');
            } else {
                this.addResult('⚠️ Vercel Config', 'No rewrite rules');
            }
            
        } catch (error) {
            this.addResult('❌ Vercel Config', `Error: ${error.message}`);
        }
    }

    addResult(status, message) {
        this.results.push({ status, message });
        console.log(`   ${status}: ${message}`);
    }

    generateReport() {
        console.log('\n📊 Deployment Test Report\n');
        
        const passed = this.results.filter(r => r.status.includes('✅')).length;
        const warnings = this.results.filter(r => r.status.includes('⚠️')).length;
        const failed = this.results.filter(r => r.status.includes('❌')).length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`⚠️ Warnings: ${warnings}`);
        console.log(`❌ Failed: ${failed}`);
        
        if (failed === 0) {
            console.log('\n🎉 Deployment Test PASSED!');
            console.log('✅ Safe to deploy to Vercel');
            process.exit(0);
        } else {
            console.log('\n💥 Deployment Test FAILED!');
            console.log('❌ Fix issues before deploying');
            process.exit(1);
        }
    }

    async testLiveDeployment(url) {
        console.log(`\n🌐 Testing live deployment: ${url}`);
        
        return new Promise((resolve) => {
            const client = url.startsWith('https') ? https : http;
            
            client.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log('✅ Live deployment working');
                        resolve(true);
                    } else {
                        console.log(`❌ Live deployment failed: ${res.statusCode}`);
                        resolve(false);
                    }
                });
            }).on('error', (error) => {
                console.log(`❌ Live deployment error: ${error.message}`);
                resolve(false);
            });
        });
    }
}

// Run tests
const tester = new DeploymentTester();

// Check if URL provided for live testing
const testUrl = process.argv[2];
if (testUrl) {
    tester.runAllTests().then(() => {
        tester.testLiveDeployment(testUrl);
    });
} else {
    tester.runAllTests();
}