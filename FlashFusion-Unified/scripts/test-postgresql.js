#!/usr/bin/env node

/**
 * PostgreSQL Connection Test Script
 * Tests the PostgreSQL database connection and schema
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const databaseService = require('../src/services/database');

async function testPostgreSQLConnection() {
    console.log('🔍 Testing PostgreSQL Database Connection...\n');

    try {
        // Initialize database connection
        const connected = await databaseService.initialize();
        
        if (!connected) {
            throw new Error('Failed to connect to database');
        }

        // Check connection status
        const status = databaseService.getConnectionStatus();
        console.log('📊 Connection Status:', {
            connected: status.connected,
            type: databaseService.dbType,
            timestamp: status.timestamp
        });

        // Test health check
        const health = await databaseService.healthCheck();
        console.log('🏥 Health Check:', health);

        // Test basic operations if PostgreSQL
        if (databaseService.dbType === 'postgresql') {
            console.log('\n🧪 Testing basic operations...');
            
            // Test getting agent personalities (should return empty array for new DB)
            const personalities = await databaseService.getAgentPersonalities();
            console.log('👥 Agent personalities:', personalities.success ? `Found ${personalities.data.length} records` : personalities.error);

            // Test creating a sample agent personality
            const testAgent = {
                agent_id: 'test-agent-' + Date.now(),
                name: 'Test Agent',
                description: 'A test agent for connection verification',
                traits: { curiosity: 0.8, helpfulness: 0.9 },
                capabilities: ['text-generation', 'analysis']
            };

            const createResult = await databaseService.createAgentPersonality(testAgent);
            if (createResult.success) {
                console.log('✅ Successfully created test agent personality');
                
                // Clean up test data
                // Note: You might want to implement a delete method for cleanup
                console.log('ℹ️  Test data created - you may want to clean up manually if needed');
            } else {
                console.log('❌ Failed to create test agent:', createResult.error);
            }
        }

        console.log('\n✅ PostgreSQL connection test completed successfully!');
        
    } catch (error) {
        console.error('\n❌ PostgreSQL connection test failed:', error.message);
        process.exit(1);
    }
}

// Print configuration info
function printConfig() {
    console.log('📋 Database Configuration:');
    console.log('- POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ Set' : '❌ Not set');
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
    console.log('- POSTGRES_HOST:', process.env.POSTGRES_HOST || 'Not set');
    console.log('- POSTGRES_PORT:', process.env.POSTGRES_PORT || 'Not set (default: 5432)');
    console.log('- POSTGRES_DB:', process.env.POSTGRES_DB || 'Not set');
    console.log('- POSTGRES_USER:', process.env.POSTGRES_USER ? '✅ Set' : '❌ Not set');
    console.log('- POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '✅ Set' : '❌ Not set');
    console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set');
    console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');
    console.log('');
}

// Main execution
if (require.main === module) {
    printConfig();
    testPostgreSQLConnection();
}

module.exports = { testPostgreSQLConnection };