#!/usr/bin/env node

/**
 * Simple FlashFusion Database Test
 */

import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testConnection() {
  console.log('🧪 Testing FlashFusion Database Connection...\n');
  
  try {
    const host = SUPABASE_URL.replace('https://', '');
    
    const options = {
      hostname: host,
      path: '/rest/v1/profiles?select=*',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      }
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: body ? JSON.parse(body) : {}
          });
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
      req.end();
    });

    if (response.statusCode === 200) {
      console.log('✅ Database connection successful!');
      console.log(`📊 Found ${response.body.length} user profiles`);
      
      response.body.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} (${profile.role})`);
      });
      
      console.log('\n🎉 FlashFusion Database is working correctly!');
    } else {
      console.log('❌ Connection failed:', response.statusCode);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();