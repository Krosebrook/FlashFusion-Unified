#!/usr/bin/env node

/**
 * FlashFusion Supabase Connection Setup & Test
 * Helps establish and verify Supabase database connection
 */

const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

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

// Read current .env file
function readEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1]] = match[2];
      }
    });
    
    return env;
  } catch (error) {
    return {};
  }
}

// Test Supabase connection
async function testSupabaseConnection(url, anonKey, serviceKey) {
  log('blue', '\n🔍 Testing Supabase Connection...');
  console.log('────────────────────────────────────────────────────');
  
  const urlToTest = `${url}/rest/v1/`;
  
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(url).hostname,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': anonKey || serviceKey,
        'Authorization': `Bearer ${anonKey || serviceKey}`,
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
          log('cyan', `   URL: ${url}`);
          resolve(true);
        } else if (res.statusCode === 401) {
          log('red', '❌ Authentication failed - Invalid API keys');
          log('yellow', '   Please check your SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY');
          resolve(false);
        } else {
          log('yellow', `⚠️  Unexpected response: ${res.statusCode}`);
          log('cyan', `   Response: ${data.substring(0, 200)}...`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log('red', '❌ Connection failed');
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

// Create tables if needed
async function createTables(url, serviceKey) {
  log('blue', '\n🏗️  Setting up FlashFusion Tables...');
  console.log('────────────────────────────────────────────────────');
  
  const queries = [
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

  for (const query of queries) {
    try {
      const result = await executeQuery(url, serviceKey, query.sql);
      if (result) {
        log('green', `✅ Table '${query.name}' ready`);
      } else {
        log('yellow', `⚠️  Table '${query.name}' may already exist`);
      }
    } catch (error) {
      log('red', `❌ Failed to create table '${query.name}': ${error.message}`);
    }
  }
}

// Execute SQL query
async function executeQuery(url, serviceKey, sql) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query: sql });
    const options = {
      hostname: new URL(url).hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
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

// Interactive setup
async function interactiveSetup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

  log('cyan', '\n🔐 Supabase Interactive Setup');
  console.log('════════════════════════════════════════════════════');
  
  const env = readEnvFile();
  
  log('blue', '\nCurrent Configuration:');
  log('cyan', `  URL: ${env.SUPABASE_URL || 'Not set'}`);
  log('cyan', `  Anon Key: ${env.SUPABASE_ANON_KEY ? (env.SUPABASE_ANON_KEY.includes('your_new') ? 'Placeholder' : 'Configured') : 'Not set'}`);
  log('cyan', `  Service Key: ${env.SUPABASE_SERVICE_ROLE_KEY ? (env.SUPABASE_SERVICE_ROLE_KEY.includes('your_new') ? 'Placeholder' : 'Configured') : 'Not set'}`);

  console.log('\n');
  log('yellow', '📋 To get your Supabase keys:');
  log('cyan', '   1. Go to https://app.supabase.com/');
  log('cyan', '   2. Select your project: yfalwodlcfanjlsnahlx');
  log('cyan', '   3. Go to Settings → API Keys');
  log('cyan', '   4. Copy the anon/public key and service_role key');

  const anonKey = await question('\n🔑 Enter your Supabase Anon Key: ');
  const serviceKey = await question('🔑 Enter your Supabase Service Role Key: ');

  rl.close();

  return { anonKey: anonKey.trim(), serviceKey: serviceKey.trim() };
}

// Update .env file
function updateEnvFile(anonKey, serviceKey) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the keys
    envContent = envContent.replace(
      /SUPABASE_ANON_KEY=.*/,
      `SUPABASE_ANON_KEY=${anonKey}`
    );
    envContent = envContent.replace(
      /SUPABASE_SERVICE_ROLE_KEY=.*/,
      `SUPABASE_SERVICE_ROLE_KEY=${serviceKey}`
    );
    
    fs.writeFileSync(envPath, envContent);
    log('green', '✅ .env file updated successfully');
    return true;
  } catch (error) {
    log('red', `❌ Failed to update .env file: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  log('bold', '\n🚀 FlashFusion Supabase Setup');
  console.log('═══════════════════════════════════════════════════════════════');

  const env = readEnvFile();
  
  // Check if keys are already configured
  const hasValidKeys = env.SUPABASE_ANON_KEY && 
                      env.SUPABASE_SERVICE_ROLE_KEY && 
                      !env.SUPABASE_ANON_KEY.includes('your_new') && 
                      !env.SUPABASE_SERVICE_ROLE_KEY.includes('your_new');

  let anonKey = env.SUPABASE_ANON_KEY;
  let serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!hasValidKeys) {
    log('yellow', '⚠️  Supabase keys not configured or using placeholders');
    const keys = await interactiveSetup();
    anonKey = keys.anonKey;
    serviceKey = keys.serviceKey;
    
    if (anonKey && serviceKey) {
      updateEnvFile(anonKey, serviceKey);
    } else {
      log('red', '❌ Setup cancelled - no keys provided');
      process.exit(1);
    }
  }

  // Test connection
  const connected = await testSupabaseConnection(env.SUPABASE_URL, anonKey, serviceKey);
  
  if (connected) {
    log('green', '\n🎉 Supabase connection established!');
    
    // Set up tables
    await createTables(env.SUPABASE_URL, serviceKey);
    
    log('cyan', '\n📊 Connection Summary:');
    console.log('────────────────────────────────────────────────────');
    log('green', `✅ Database: Connected`);
    log('green', `✅ URL: ${env.SUPABASE_URL}`);
    log('green', `✅ Authentication: Working`);
    log('green', `✅ Tables: Ready for FlashFusion`);
    
    log('blue', '\n🚀 Next Steps:');
    log('cyan', '   • Restart FlashFusion: npm start');
    log('cyan', '   • Test health: curl http://localhost:3001/health');
    log('cyan', '   • View dashboard: http://localhost:3001/docs');
    
  } else {
    log('red', '\n❌ Failed to connect to Supabase');
    log('yellow', '💡 Troubleshooting:');
    log('cyan', '   • Verify your API keys are correct');
    log('cyan', '   • Check your project URL: https://yfalwodlcfanjlsnahlx.supabase.co');
    log('cyan', '   • Ensure your Supabase project is active');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSupabaseConnection, createTables };