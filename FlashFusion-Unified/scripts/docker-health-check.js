#!/usr/bin/env node

/**
 * Docker Health Check Script for FlashFusion Unified
 * Validates container health and core services
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3333;
const HEALTH_TIMEOUT = 5000; // 5 seconds

async function checkHealth() {
    try {
        // Check if main server is responding
        const serverHealthy = await checkServerHealth();
        
        // Check if core files exist
        const filesHealthy = checkCoreFiles();
        
        // Check if database service is available
        const dbHealthy = await checkDatabaseService();
        
        if (serverHealthy && filesHealthy && dbHealthy) {
            console.log('✅ Health check passed');
            process.exit(0);
        } else {
            console.log('❌ Health check failed');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Health check error:', error.message);
        process.exit(1);
    }
}

function checkServerHealth() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/health',
            method: 'GET',
            timeout: HEALTH_TIMEOUT
        };

        const req = http.request(options, (res) => {
            if (res.statusCode === 200) {
                resolve(true);
            } else {
                console.log(`Server health check failed: ${res.statusCode}`);
                resolve(false);
            }
        });

        req.on('error', (error) => {
            console.log(`Server health check error: ${error.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log('Server health check timeout');
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

function checkCoreFiles() {
    const coreFiles = [
        'src/index.js',
        'src/core/FlashFusionCore.js',
        'src/services/database.js',
        'package.json'
    ];

    for (const file of coreFiles) {
        const filePath = path.join('/app', file);
        if (!fs.existsSync(filePath)) {
            console.log(`Missing core file: ${file}`);
            return false;
        }
    }

    return true;
}

async function checkDatabaseService() {
    try {
        // Try to require and test database service
        const databaseService = require('/app/src/services/database');
        
        // Check if service is initialized
        if (databaseService.getConnectionStatus) {
            const status = databaseService.getConnectionStatus();
            return status.connected || status.dbType; // Return true if connected or configured
        }
        
        return true; // Service exists
    } catch (error) {
        console.log(`Database service check failed: ${error.message}`);
        return false;
    }
}

// Run health check
checkHealth();