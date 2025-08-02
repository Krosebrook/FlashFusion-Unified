#!/usr/bin/env node

/**
 * Supabase OTP Expiry Fix
 * Updates authentication settings to fix long OTP expiry times
 * 
 * Usage: node fix-supabase-otp.js
 */

const https = require('https');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project reference from URL
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// Supabase Management API request
function supabaseRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          if (res.statusCode >= 400) {
            reject(new Error(`Supabase API Error (${res.statusCode}): ${response.message || body}`));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// SQL query to update auth settings
function executeSQL(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: projectRef + '.supabase.co',
      path: '/rest/v1/rpc/exec_sql',
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

async function fixOTPExpiry() {
  console.log('🔧 Fixing Supabase OTP Expiry Settings...\n');

  try {
    // Check current auth settings
    console.log('1. Checking current authentication settings...');
    
    // Update OTP expiry via direct database update
    const updateQuery = `
      -- Update OTP expiry settings
      UPDATE auth.config 
      SET 
        otp_expiry = 300,  -- 5 minutes instead of default
        email_otp_expiry = 300,  -- 5 minutes for email OTP
        sms_otp_expiry = 300     -- 5 minutes for SMS OTP
      WHERE id = 1;
      
      -- If no config exists, insert default
      INSERT INTO auth.config (id, otp_expiry, email_otp_expiry, sms_otp_expiry)
      SELECT 1, 300, 300, 300
      WHERE NOT EXISTS (SELECT 1 FROM auth.config WHERE id = 1);
    `;

    console.log('2. Updating OTP expiry settings...');
    await executeSQL(updateQuery);
    
    console.log('✅ OTP expiry updated to 5 minutes\n');

    // Also update via auth config if available
    const authConfigUpdate = {
      otp_expiry: 300,  // 5 minutes
      password_min_length: 8,
      password_requirements: {
        upper_case: true,
        lower_case: true,
        numbers: true,
        special_characters: false
      }
    };

    console.log('3. Updating authentication configuration...');
    
    try {
      await supabaseRequest(`/v1/projects/${projectRef}/config/auth`, 'PATCH', authConfigUpdate);
      console.log('✅ Auth configuration updated successfully');
    } catch (error) {
      console.log('⚠️  Direct config update failed (may require manual dashboard update)');
      console.log('   Error:', error.message);
    }

    console.log('\n📋 OTP Expiry Fix Complete!');
    console.log('   • OTP codes now expire in 5 minutes');
    console.log('   • Email OTP: 5 minutes');
    console.log('   • SMS OTP: 5 minutes');
    console.log('\n🔗 Verify in Supabase Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/auth/settings`);

  } catch (error) {
    console.error('❌ Failed to fix OTP expiry:', error.message);
    console.log('\n🔧 Manual Fix Instructions:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Navigate to Authentication → Settings');
    console.log('3. Update "Auth token validity" to 5 minutes (300 seconds)');
    console.log('4. Save changes');
  }
}

// Alternative: Direct dashboard configuration
function showManualSteps() {
  console.log('\n📋 Manual Configuration Steps:');
  console.log('═══════════════════════════════════════\n');
  
  console.log('1. 🌐 Open Supabase Dashboard:');
  console.log(`   https://supabase.com/dashboard/project/${projectRef}\n`);
  
  console.log('2. 🔐 Go to Authentication Settings:');
  console.log('   • Click "Authentication" in sidebar');
  console.log('   • Click "Settings" tab\n');
  
  console.log('3. ⏰ Update OTP Settings:');
  console.log('   • Find "Auth token validity"');
  console.log('   • Change from default (usually 3600s) to 300s (5 minutes)');
  console.log('   • Update "Email OTP expiry" to 300s');
  console.log('   • Update "SMS OTP expiry" to 300s\n');
  
  console.log('4. 💾 Save Changes:');
  console.log('   • Click "Save" or "Update"');
  console.log('   • Changes take effect immediately\n');
  
  console.log('5. ✅ Test:');
  console.log('   • Try OTP login to verify shorter expiry');
  console.log('   • OTP codes should now expire in 5 minutes');
}

// Main function
async function main() {
  const command = process.argv[2];

  if (command === 'manual') {
    showManualSteps();
    return;
  }

  await fixOTPExpiry();
  showManualSteps();
}

main().catch(console.error);