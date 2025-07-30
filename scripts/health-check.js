#!/usr/bin/env node

/**
 * Health Check Script for FlashFusion
 * Validates deployment readiness and system health
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

function checkEnvironmentVariable(varName, required = true) {
    const value = process.env[varName];
    if (!value && required) {
        log(`❌ Missing required environment variable: ${varName}`, 'red');
        return false;
    } else if (!value && !required) {
        log(`⚠️  Optional environment variable not set: ${varName}`, 'yellow');
        return true;
    } else {
        log(`✅ ${varName}: Set`, 'green');
        return true;
    }
}

function checkUrl(url) {
    return new Promise((resolve) => {
        const request = https.get(url, (response) => {
            resolve({
                status: response.statusCode,
                success: response.statusCode >= 200 && response.statusCode < 400
            });
        });
        
        request.on('error', () => {
            resolve({ status: 0, success: false });
        });
        
        request.setTimeout(10000, () => {
            request.destroy();
            resolve({ status: 0, success: false });
        });
    });
}

async function runHealthCheck() {
    log('🔍 FlashFusion Health Check Starting...', 'blue');
    console.log();

    let issues = 0;
    let warnings = 0;

    // Check critical files
    log('📁 File System Check:', 'blue');
    const criticalFiles = [
        'package.json',
        'firebase.json',
        '.firebaserc',
        'functions/index.js',
        'api/index.js'
    ];

    for (const file of criticalFiles) {
        if (checkFileExists(file)) {
            log(`✅ ${file}`, 'green');
        } else {
            log(`❌ Missing: ${file}`, 'red');
            issues++;
        }
    }

    console.log();

    // Check environment variables
    log('🔧 Environment Variables:', 'blue');
    const requiredVars = ['NODE_ENV'];
    const optionalVars = [
        'JWT_SECRET',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY',
        'NOTION_API_KEY'
    ];

    for (const varName of requiredVars) {
        if (!checkEnvironmentVariable(varName, true)) {
            issues++;
        }
    }

    for (const varName of optionalVars) {
        if (!checkEnvironmentVariable(varName, false)) {
            warnings++;
        }
    }

    console.log();

    // Check deployment endpoints
    log('🌐 Deployment Health Check:', 'blue');
    const endpoints = [
        {
            name: 'Firebase Functions',
            url: 'https://us-central1-tessa-designs-m3u6y.cloudfunctions.net/flashfusionApi/health'
        },
        {
            name: 'Firebase Hosting',
            url: 'https://tessa-designs-m3u6y.web.app'
        },
        {
            name: 'Vercel API',
            url: 'https://flashfusion-unified.vercel.app/api/health'
        }
    ];

    for (const endpoint of endpoints) {
        try {
            const result = await checkUrl(endpoint.url);
            if (result.success) {
                log(`✅ ${endpoint.name}: Online (${result.status})`, 'green');
            } else {
                log(`❌ ${endpoint.name}: Offline (${result.status})`, 'red');
                issues++;
            }
        } catch (error) {
            log(`❌ ${endpoint.name}: Error checking`, 'red');
            issues++;
        }
    }

    console.log();

    // Summary
    log('📊 Health Check Summary:', 'blue');
    if (issues === 0 && warnings === 0) {
        log('🎉 All systems operational!', 'green');
    } else if (issues === 0) {
        log(`⚠️  System operational with ${warnings} warnings`, 'yellow');
    } else {
        log(`❌ ${issues} critical issues found, ${warnings} warnings`, 'red');
    }

    console.log();

    // Recommendations
    if (issues > 0) {
        log('🔧 Recommended Actions:', 'blue');
        log('1. Run: npm run setup', 'yellow');
        log('2. Check Firebase deployment: firebase deploy', 'yellow');
        log('3. Verify environment variables in deployment platform', 'yellow');
        log('4. Run: npm run deploy', 'yellow');
    }

    return issues === 0;
}

// Run health check
if (require.main === module) {
    runHealthCheck().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        log(`💥 Health check failed: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runHealthCheck };