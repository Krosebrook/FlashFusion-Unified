#!/usr/bin/env node

/**
 * Supabase Hooks Setup Script
 * Automatically configures database hooks and webhooks
 */

import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

// Execute SQL on Supabase
function executeSql(query) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`SQL Error (${res.statusCode}): ${body}`));
        } else {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query }));
    req.end();
  });
}

// Get Supabase project settings
function getProjectSettings() {
  return new Promise((resolve, reject) => {
    const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
    
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectRef}/settings`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`Settings Error: ${body}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Main setup function
async function setupHooks() {
  console.log('🚀 Setting up Supabase Hooks for FlashFusion...\n');

  try {
    // 1. Read and execute the SQL file
    console.log('📄 Reading hooks SQL file...');
    const sqlContent = fs.readFileSync('./supabase-hooks.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    // 2. Execute each SQL statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments and empty statements
      if (statement.trim().startsWith('/*') || statement.trim().length < 10) {
        continue;
      }

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        await executeSql(statement);
        successCount++;
      } catch (error) {
        console.log(`❌ Error in statement ${i + 1}: ${error.message}`);
        errorCount++;
        
        // Continue with other statements unless it's a critical error
        if (error.message.includes('already exists')) {
          console.log('   ℹ️  Resource already exists, continuing...');
        }
      }
    }

    // 3. Configure webhook URL if provided
    if (ZAPIER_WEBHOOK_URL) {
      console.log('\n🔗 Configuring webhook URL...');
      try {
        await executeSql(`ALTER DATABASE postgres SET app.webhook_url = '${ZAPIER_WEBHOOK_URL}';`);
        console.log('✅ Webhook URL configured');
      } catch (error) {
        console.log(`⚠️  Could not set webhook URL: ${error.message}`);
      }
    }

    // 4. Summary
    console.log('\n' + '═'.repeat(50));
    console.log('📊 Setup Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 All hooks set up successfully!');
    } else {
      console.log('\n⚠️  Some hooks failed to install. Check Supabase logs.');
    }

    // 5. Next steps
    console.log('\n📋 Next Steps:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Verify functions and triggers are created');
    console.log('3. Test webhooks with sample data');
    console.log('4. Monitor webhook_log table for delivery status');
    
    if (!ZAPIER_WEBHOOK_URL) {
      console.log('5. Add ZAPIER_WEBHOOK_URL to .env and run again');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Test webhook function
async function testWebhook() {
  if (!ZAPIER_WEBHOOK_URL) {
    console.log('⚠️  No webhook URL configured');
    return;
  }

  console.log('\n🧪 Testing webhook delivery...');

  try {
    await executeSql(`
      SELECT send_webhook_notification(
        'test_event',
        json_build_object(
          'message', 'FlashFusion hooks test',
          'timestamp', now(),
          'source', 'setup-script'
        )::jsonb
      );
    `);
    
    console.log('✅ Test webhook sent successfully');
    console.log('   Check your Zapier dashboard for the test event');
  } catch (error) {
    console.log(`❌ Webhook test failed: ${error.message}`);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'test':
      await testWebhook();
      break;
    case 'setup':
    default:
      await setupHooks();
      if (process.argv.includes('--test')) {
        await testWebhook();
      }
      break;
  }
}

main().catch(console.error);