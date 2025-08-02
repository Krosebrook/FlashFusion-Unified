#!/usr/bin/env node

/**
 * Test Notion API Configuration
 * Usage: node test-notion-api.js
 */

import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

function makeNotionRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: response
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testNotionAPI() {
  console.log('📄 Testing Notion API Configuration\n');

  // Check API key
  console.log('📋 Configuration Check:');
  console.log(`   API Key: ${NOTION_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Version: ${NOTION_VERSION}\n`);

  if (!NOTION_API_KEY) {
    console.log('❌ Missing NOTION_API_KEY in .env file');
    return;
  }

  try {
    // Test 1: Get current user
    console.log('🧪 Test 1: Get Current User');
    const userResponse = await makeNotionRequest('/v1/users/me');
    
    if (userResponse.statusCode === 200) {
      console.log('✅ API key valid');
      console.log(`   User: ${userResponse.body.name || 'Integration'}`);
      console.log(`   Type: ${userResponse.body.type}`);
    } else {
      console.log(`❌ API key test failed: ${userResponse.statusCode}`);
      console.log(`   Error: ${userResponse.body.message || 'Unknown error'}`);
      return;
    }

    // Test 2: List accessible databases
    console.log('\n🧪 Test 2: List Accessible Databases');
    const dbResponse = await makeNotionRequest('/v1/search', 'POST', {
      filter: { property: 'object', value: 'database' }
    });

    if (dbResponse.statusCode === 200) {
      const databases = dbResponse.body.results || [];
      console.log(`✅ Found ${databases.length} accessible databases`);
      
      databases.slice(0, 3).forEach((db, index) => {
        console.log(`   ${index + 1}. ${db.title?.[0]?.plain_text || 'Untitled'} (${db.id})`);
      });

      if (databases.length > 0) {
        console.log('\n💡 To use a database, add its ID to NOTION_DATABASE_ID in .env');
      }
    } else {
      console.log(`⚠️  Database search failed: ${dbResponse.statusCode}`);
      console.log('   This might mean no pages/databases are shared with the integration');
    }

    // Test 3: List accessible pages
    console.log('\n🧪 Test 3: List Accessible Pages');
    const pageResponse = await makeNotionRequest('/v1/search', 'POST', {
      filter: { property: 'object', value: 'page' }
    });

    if (pageResponse.statusCode === 200) {
      const pages = pageResponse.body.results || [];
      console.log(`✅ Found ${pages.length} accessible pages`);
      
      pages.slice(0, 3).forEach((page, index) => {
        const title = page.properties?.title?.title?.[0]?.plain_text || 
                     page.properties?.Name?.title?.[0]?.plain_text || 
                     'Untitled';
        console.log(`   ${index + 1}. ${title} (${page.id})`);
      });
    } else {
      console.log(`⚠️  Page search failed: ${pageResponse.statusCode}`);
    }

    console.log('\n🎉 Notion API tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Share specific pages/databases with your FlashFusion integration');
    console.log('2. Copy database IDs to your .env file if needed');
    console.log('3. Test creating/updating content in Notion');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotionAPI();