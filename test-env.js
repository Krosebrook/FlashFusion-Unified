#!/usr/bin/env node

/**
 * FlashFusion Environment Validation Test
 * Tests all API keys and configurations
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

// Test Anthropic API
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
      model: 'claude-3-sonnet-20240229',
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

// Test Supabase Connection
addTest('Supabase Database', async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return { status: 'skip', message: 'Missing Supabase credentials' };
  
  try {
    const supabaseHost = url.replace('https://', '');
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
      return { status: 'pass', message: 'Database connection successful' };
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
      return { status: 'pass', message: `Connected as ${user.username || user.email}` };
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

// Test Notion API
addTest('Notion Integration', async () => {
  const token = process.env.NOTION_API_KEY;
  if (!token) return { status: 'skip', message: 'No Notion token provided' };
  
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
      return { status: 'pass', message: 'Notion API connected' };
    } else {
      const error = JSON.parse(response.body);
      return { status: 'fail', message: error.message || 'API error' };
    }
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
});

// Environment validation
addTest('Environment Variables', async () => {
  const required = [
    'ANTHROPIC_API_KEY',
    'SUPABASE_URL', 
    'SUPABASE_ANON_KEY',
    'GITHUB_TOKEN'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length === 0) {
    return { status: 'pass', message: 'All required variables present' };
  } else {
    return { status: 'fail', message: `Missing: ${missing.join(', ')}` };
  }
});

// Run all tests
async function runTests() {
  console.log('🧪 FlashFusion Environment Test Suite\n');
  console.log('═'.repeat(50));

  for (const test of tests) {
    process.stdout.write(`${test.name}... `);
    
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

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);

  if (failed > 0) {
    console.log('\n🔧 Issues Found:');
    Object.entries(results)
      .filter(([_, result]) => result.status === 'fail')
      .forEach(([name, result]) => {
        console.log(`   • ${name}: ${result.message}`);
      });
  }

  if (passed === tests.length - skipped) {
    console.log('\n🎉 All tests passed! FlashFusion is ready to go!');
  }
}

runTests().catch(console.error);