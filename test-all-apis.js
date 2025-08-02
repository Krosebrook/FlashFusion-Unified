#!/usr/bin/env node

/**
 * Comprehensive FlashFusion API Test Suite
 * Tests all configured APIs and services
 */

import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const tests = [];
const results = {};

// Test function wrapper
function addTest(name, testFn) {
  tests.push({ name, testFn });
}

// HTTP request helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test Anthropic API with correct model
addTest('Anthropic Claude API', async () => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { status: 'skip', message: 'No API key provided' };
  
  try {
    const response = await makeRequest({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }, {
      model: 'claude-3-5-sonnet-20241022', // Updated model
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    });

    if (response.statusCode === 200) {
      return { status: 'pass', message: 'API key valid' };
    } else {
      const error = JSON.parse(response.body);
      return { status: 'fail', message: error.error?.message || 'API error' };
    }
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
});

// Test OpenAI API
addTest('OpenAI API', async () => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { status: 'skip', message: 'No API key provided' };
  
  try {
    const response = await makeRequest({
      hostname: 'api.openai.com',
      path: '/v1/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.statusCode === 200) {
      return { status: 'pass', message: 'API key valid' };
    } else {
      const error = JSON.parse(response.body);
      return { status: 'fail', message: error.error?.message || 'API error' };
    }
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
});

// Test Google AI API
addTest('Google AI API', async () => {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return { status: 'skip', message: 'No API key provided' };
  
  try {
    const response = await makeRequest({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1/models?key=${key}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.statusCode === 200) {
      return { status: 'pass', message: 'API key valid' };
    } else {
      return { status: 'fail', message: `Status: ${response.statusCode}` };
    }
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
});

// Test Supabase Connection (fix URL)
addTest('Supabase Database', async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  
  // Fix dashboard URL to actual API URL
  let apiUrl = url;
  if (url && url.includes('dashboard')) {
    // Extract project ref from anon key
    try {
      const payload = JSON.parse(atob(key.split('.')[1]));
      const projectRef = payload.ref;
      apiUrl = `https://${projectRef}.supabase.co`;
    } catch (e) {
      return { status: 'fail', message: 'Invalid Supabase URL format' };
    }
  }
  
  if (!apiUrl || !key) return { status: 'skip', message: 'Missing Supabase credentials' };
  
  try {
    const supabaseHost = apiUrl.replace('https://', '');
    const response = await makeRequest({
      hostname: supabaseHost,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });

    if (response.statusCode === 200) {
      return { status: 'pass', message: `Connected to ${supabaseHost}` };
    } else {
      return { status: 'fail', message: `Status: ${response.statusCode}` };
    }
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
});

// Test Vercel API
addTest('Vercel Deployment', async () => {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { status: 'skip', message: 'No Vercel token provided' };
  
  try {
    const response = await makeRequest({
      hostname: 'api.vercel.com',
      path: '/v2/user',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.statusCode === 200) {
      const user = JSON.parse(response.body);
      return { status: 'pass', message: `Connected as ${user.username || user.email || 'User'}` };
    } else {
      const error = JSON.parse(response.body);
      return { status: 'fail', message: error.error?.message || 'API error' };
    }
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
});

// Test GitHub API
addTest('GitHub Integration', async () => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { status: 'skip', message: 'No GitHub token provided' };
  
  try {
    const response = await makeRequest({
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'FlashFusion-Test'
      }
    });

    if (response.statusCode === 200) {
      const user = JSON.parse(response.body);
      return { status: 'pass', message: `Connected as ${user.login}` };
    } else {
      const error = JSON.parse(response.body);
      return { status: 'fail', message: error.message || 'API error' };
    }
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
});

// Test Notion API (multiple possible keys)
addTest('Notion Integration', async () => {
  const keys = [
    process.env.NOTION_API_KEY_SECRET,
    process.env.NOTION_API_KEY_internal,
    process.env.NOTION_API_KEY
  ].filter(Boolean);

  if (keys.length === 0) {
    return { status: 'skip', message: 'No Notion API key provided' };
  }

  for (const token of keys) {
    try {
      const response = await makeRequest({
        hostname: 'api.notion.com',
        path: '/v1/users/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28'
        }
      });

      if (response.statusCode === 200) {
        const user = JSON.parse(response.body);
        return { status: 'pass', message: `Connected as ${user.name || 'Integration'}` };
      }
    } catch (error) {
      continue; // Try next key
    }
  }

  return { status: 'fail', message: 'All Notion API keys failed' };
});

// Test GitHub OAuth
addTest('GitHub OAuth Setup', async () => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return { status: 'skip', message: 'GitHub OAuth not configured' };
  }

  if (clientId.includes('PASTE_YOUR')) {
    return { status: 'fail', message: 'Placeholder values still present' };
  }

  return { status: 'pass', message: `OAuth configured (${clientId})` };
});

// Test Stripe API
addTest('Stripe Payment Processing', async () => {
  const key = process.env.STRIPE_SECRET_KEY;
  
  if (!key) return { status: 'skip', message: 'No Stripe key provided' };
  
  if (key.includes('PASTE_YOUR')) {
    return { status: 'skip', message: 'Placeholder value' };
  }

  try {
    const response = await makeRequest({
      hostname: 'api.stripe.com',
      path: '/v1/balance',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.statusCode === 200) {
      return { status: 'pass', message: 'Stripe API connected' };
    } else {
      return { status: 'fail', message: `Status: ${response.statusCode}` };
    }
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
});

// Run all tests
async function runAllTests() {
  console.log('🧪 FlashFusion Comprehensive API Test Suite\n');
  console.log('═'.repeat(60));

  const startTime = Date.now();

  for (const test of tests) {
    process.stdout.write(`${test.name.padEnd(30)}... `);
    
    try {
      const result = await test.testFn();
      results[test.name] = result;
      
      const icon = result.status === 'pass' ? '✅' : 
                   result.status === 'fail' ? '❌' : '⏭️';
      
      console.log(`${icon} ${result.message}`);
    } catch (error) {
      results[test.name] = { status: 'error', message: error.message };
      console.log(`❌ Error: ${error.message}`);
    }
  }

  // Summary
  const passed = Object.values(results).filter(r => r.status === 'pass').length;
  const failed = Object.values(results).filter(r => r.status === 'fail').length;
  const skipped = Object.values(results).filter(r => r.status === 'skip').length;
  const errors = Object.values(results).filter(r => r.status === 'error').length;

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.log('\n' + '═'.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ⚠️  Errors: ${errors}`);
  console.log(`   ⏱️  Duration: ${duration}s`);

  if (failed > 0 || errors > 0) {
    console.log('\n🔧 Issues Found:');
    Object.entries(results)
      .filter(([_, result]) => result.status === 'fail' || result.status === 'error')
      .forEach(([name, result]) => {
        console.log(`   • ${name}: ${result.message}`);
      });
  }

  const readyServices = passed;
  const totalConfigured = passed + failed;
  const completionRate = totalConfigured > 0 ? ((passed / totalConfigured) * 100).toFixed(0) : 0;

  console.log(`\n🎯 FlashFusion API Status: ${completionRate}% Ready`);
  console.log(`   ${readyServices} services operational`);

  if (passed === tests.length - skipped) {
    console.log('\n🎉 All configured APIs are working! FlashFusion is ready to deploy!');
  } else if (passed >= 4) {
    console.log('\n✅ Core APIs working. FlashFusion can launch with current setup.');
  } else {
    console.log('\n⚠️  Several APIs need attention before FlashFusion is production-ready.');
  }
}

runAllTests().catch(console.error);