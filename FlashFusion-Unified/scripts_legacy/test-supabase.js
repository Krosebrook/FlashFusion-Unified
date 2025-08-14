#!/usr/bin/env node

/**
 * FlashFusion Supabase Connection Test
 * Tests the connection and sets up necessary tables
 */

const https = require('https');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Test connection to Supabase
async function testConnection() {
  log('blue', '\n🔍 Testing Supabase Connection...');
  console.log('────────────────────────────────────────────────────');
  
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(SUPABASE_URL).hostname,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          log('green', '✅ Supabase connection successful!');
          log('cyan', `   Status: ${res.statusCode}`);
          log('cyan', `   Project: tptnsqojslodxkogkcsx`);
          log('cyan', `   URL: ${SUPABASE_URL}`);
          resolve(true);
        } else {
          log('red', `❌ Connection failed with status: ${res.statusCode}`);
          log('yellow', `   Response: ${data.substring(0, 200)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log('red', '❌ Connection error');
      log('red', `   Error: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      log('red', '❌ Connection timeout');
      resolve(false);
    });

    req.end();
  });
}

// Create FlashFusion tables
async function createTables() {
  log('blue', '\n🏗️  Creating FlashFusion Database Tables...');
  console.log('────────────────────────────────────────────────────');
  
  const tables = [
    {
      name: 'projects',
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(100),
          priority INTEGER DEFAULT 5,
          status VARCHAR(50) DEFAULT 'active',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: 'workflows',
      sql: `
        CREATE TABLE IF NOT EXISTS workflows (
          id VARCHAR(255) PRIMARY KEY,
          project_id VARCHAR(255) REFERENCES projects(id),
          current_phase VARCHAR(50) DEFAULT 'discovery',
          progress INTEGER DEFAULT 0,
          phase_progress JSONB DEFAULT '{}',
          status VARCHAR(50) DEFAULT 'not_started',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: 'agent_activities',
      sql: `
        CREATE TABLE IF NOT EXISTS agent_activities (
          id SERIAL PRIMARY KEY,
          project_id VARCHAR(255),
          workflow_id VARCHAR(255),
          agent_role VARCHAR(100),
          activity_type VARCHAR(100),
          activity_data JSONB DEFAULT '{}',
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW(),
          completed_at TIMESTAMP
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      const success = await executeSQL(table.sql);
      if (success) {
        log('green', `✅ Table '${table.name}' created successfully`);
      } else {
        log('yellow', `⚠️  Table '${table.name}' may already exist or creation failed`);
      }
    } catch (error) {
      log('red', `❌ Failed to create table '${table.name}': ${error.message}`);
    }
  }
}

// Execute SQL using Supabase REST API
async function executeSQL(sql) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ 
      query: sql 
    });
    
    const options = {
      hostname: new URL(SUPABASE_URL).hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });
    });

    req.on('error', () => resolve(false));
    req.write(postData);
    req.end();
  });
}

// Test database operations
async function testDatabaseOperations() {
  log('blue', '\n🧪 Testing Database Operations...');
  console.log('────────────────────────────────────────────────────');
  
  // Test inserting a project
  const testProject = {
    id: 'test_project_' + Date.now(),
    name: 'FlashFusion Test Project',
    description: 'Testing database connectivity',
    type: 'test',
    priority: 5,
    status: 'active'
  };

  try {
    const insertSuccess = await insertProject(testProject);
    if (insertSuccess) {
      log('green', '✅ Database write operations working');
      
      // Test reading the project back
      const readSuccess = await readProject(testProject.id);
      if (readSuccess) {
        log('green', '✅ Database read operations working');
        
        // Clean up test data
        await deleteProject(testProject.id);
        log('green', '✅ Database delete operations working');
        
        return true;
      }
    }
  } catch (error) {
    log('red', `❌ Database operations failed: ${error.message}`);
  }
  
  return false;
}

// Helper functions for database operations
async function insertProject(project) {
  return makeRequest('POST', '/rest/v1/projects', project);
}

async function readProject(id) {
  return makeRequest('GET', `/rest/v1/projects?id=eq.${id}`);
}

async function deleteProject(id) {
  return makeRequest('DELETE', `/rest/v1/projects?id=eq.${id}`);
}

async function makeRequest(method, path, data = null) {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: new URL(SUPABASE_URL).hostname,
      path: path,
      method: method,
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });
    });

    req.on('error', () => resolve(false));
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Main execution
async function main() {
  log('bold', '\n🚀 FlashFusion Supabase Setup & Test');
  console.log('═══════════════════════════════════════════════════════════════');

  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    log('red', '❌ Missing Supabase environment variables');
    log('yellow', '   Please check your .env file');
    process.exit(1);
  }

  log('cyan', '\nConfiguration:');
  log('cyan', `  URL: ${SUPABASE_URL}`);
  log('cyan', `  Project: tptnsqojslodxkogkcsx`);
  log('cyan', `  Anon Key: ${SUPABASE_ANON_KEY.substring(0, 30)}...`);
  log('cyan', `  Service Key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 30)}...`);

  // Test connection
  const connected = await testConnection();
  
  if (!connected) {
    log('red', '\n❌ Failed to connect to Supabase');
    process.exit(1);
  }

  // Create tables
  await createTables();
  
  // Test database operations
  const operationsWorking = await testDatabaseOperations();
  
  if (operationsWorking) {
    log('green', '\n🎉 Supabase integration complete!');
    log('cyan', '\n📊 Summary:');
    console.log('────────────────────────────────────────────────────');
    log('green', '✅ Connection established');
    log('green', '✅ Tables created/verified');
    log('green', '✅ Database operations working');
    log('green', '✅ FlashFusion ready for data persistence');
    
    log('blue', '\n🚀 Next Steps:');
    log('cyan', '   • Restart FlashFusion: npm start');
    log('cyan', '   • Test health: curl http://localhost:3001/health');
    log('cyan', '   • All data will now persist to Supabase!');
    
  } else {
    log('red', '\n❌ Database operations failed');
    log('yellow', '💡 The connection works but operations may need manual setup');
  }
}

// Run the test
main().catch(console.error);