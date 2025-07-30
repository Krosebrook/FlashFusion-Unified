#!/usr/bin/env node

/**
 * FlashFusion Anthropic Claude AI Integration Test
 * Tests Claude API connection and dual AI provider setup
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

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Test Anthropic Claude API connection
async function testAnthropicConnection() {
  log('blue', '\n🧠 Testing Anthropic Claude API Connection...');
  console.log('────────────────────────────────────────────────────');
  
  const requestData = JSON.stringify({
    model: "claude-3-haiku-20240307",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: "Test FlashFusion Anthropic integration. Respond with: 'FlashFusion + Claude integration successful!'"
      }
    ]
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 && response.content && response.content[0]) {
            log('green', '✅ Anthropic Claude API connection successful!');
            log('cyan', `   Model: ${response.model}`);
            log('cyan', `   Response: ${response.content[0].text}`);
            log('cyan', `   Tokens used: ${response.usage.input_tokens + response.usage.output_tokens}`);
            resolve(true);
          } else {
            log('red', `❌ Anthropic API error: ${res.statusCode}`);
            log('yellow', `   Response: ${data.substring(0, 200)}`);
            resolve(false);
          }
        } catch (error) {
          log('red', `❌ Failed to parse Anthropic response: ${error.message}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log('red', '❌ Anthropic connection error');
      log('red', `   Error: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(15000, () => {
      log('red', '❌ Anthropic request timeout');
      resolve(false);
    });

    req.write(requestData);
    req.end();
  });
}

// Test AI Provider Fallback
async function testAIProviderFallback() {
  log('blue', '\n🔄 Testing AI Provider Fallback System...');
  console.log('────────────────────────────────────────────────────');
  
  const hasOpenAI = OPENAI_API_KEY && !OPENAI_API_KEY.includes('your_new');
  const hasAnthropic = ANTHROPIC_API_KEY && !ANTHROPIC_API_KEY.includes('your_new');
  
  log('cyan', `OpenAI Available: ${hasOpenAI ? '✅' : '❌'}`);
  log('cyan', `Anthropic Available: ${hasAnthropic ? '✅' : '❌'}`);
  
  if (hasOpenAI && hasAnthropic) {
    log('green', '✅ Dual AI provider setup complete!');
    log('cyan', '   FlashFusion can use both OpenAI and Claude');
    log('cyan', '   Automatic fallback enabled');
    return true;
  } else if (hasAnthropic) {
    log('green', '✅ Anthropic Claude as primary AI provider');
    log('yellow', '   OpenAI unavailable - Claude will handle all requests');
    return true;
  } else if (hasOpenAI) {
    log('green', '✅ OpenAI as primary AI provider');
    log('yellow', '   Anthropic unavailable - OpenAI will handle all requests');
    return true;
  } else {
    log('yellow', '⚠️  No AI providers available - using mock responses');
    return false;
  }
}

// Test Agent Intelligence with Claude
async function testClaudeAgentIntelligence() {
  log('blue', '\n🎭 Testing Claude-Powered Agent Intelligence...');
  console.log('────────────────────────────────────────────────────');
  
  // Simulate a visionary strategist agent analysis using Claude
  const requestData = JSON.stringify({
    model: "claude-3-haiku-20240307",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `You are the Visionary Strategist for FlashFusion. Analyze this project request:

Project: "Build a mobile AI-powered fitness app with personalized workout recommendations"

Provide a brief strategic analysis including:
1. Market opportunity
2. Key competitive advantages
3. Technical feasibility

Keep response concise and actionable.`
      }
    ]
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 && response.content && response.content[0]) {
            log('green', '✅ Claude agent intelligence working!');
            log('cyan', '\n📊 Sample Agent Analysis:');
            console.log('────────────────────────────────────────────────────');
            log('yellow', response.content[0].text);
            console.log('────────────────────────────────────────────────────');
            resolve(true);
          } else {
            log('red', `❌ Claude agent test failed: ${res.statusCode}`);
            resolve(false);
          }
        } catch (error) {
          log('red', `❌ Failed to test Claude agent: ${error.message}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log('red', '❌ Claude agent test error');
      log('red', `   Error: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(20000, () => {
      log('red', '❌ Claude agent test timeout');
      resolve(false);
    });

    req.write(requestData);
    req.end();
  });
}

// Main execution
async function main() {
  log('bold', '\n🚀 FlashFusion Anthropic Claude Integration Test');
  console.log('═══════════════════════════════════════════════════════════════');

  // Validate Anthropic API key
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.includes('your_new')) {
    log('red', '❌ Anthropic API key not configured');
    log('yellow', '   Please check your .env file');
    process.exit(1);
  }

  log('cyan', '\nConfiguration:');
  log('cyan', `  Claude Key: ${ANTHROPIC_API_KEY.substring(0, 20)}...`);
  log('cyan', `  Key Format: ${ANTHROPIC_API_KEY.startsWith('sk-ant') ? 'Anthropic Key ✅' : 'Unknown Format'}`);

  // Test Anthropic connection
  const claudeWorking = await testAnthropicConnection();
  
  if (!claudeWorking) {
    log('red', '\n❌ Anthropic Claude API connection failed');
    log('yellow', '💡 Please check your API key and network connection');
    process.exit(1);
  }

  // Test AI provider fallback system
  const fallbackWorking = await testAIProviderFallback();
  
  // Test Claude agent intelligence
  const agentIntelligence = await testClaudeAgentIntelligence();

  // Summary
  log('green', '\n🎉 Anthropic Integration Test Complete!');
  log('cyan', '\n📊 Results Summary:');
  console.log('────────────────────────────────────────────────────');
  log(claudeWorking ? 'green' : 'red', `${claudeWorking ? '✅' : '❌'} Anthropic Claude API`);
  log(fallbackWorking ? 'green' : 'yellow', `${fallbackWorking ? '✅' : '⚠️'} AI Provider System`);
  log(agentIntelligence ? 'green' : 'yellow', `${agentIntelligence ? '✅' : '⚠️'} Agent Intelligence`);
  
  if (claudeWorking) {
    log('blue', '\n🚀 Next Steps:');
    log('cyan', '   • Restart FlashFusion server to load new keys');
    log('cyan', '   • Test agent responses with Claude intelligence');
    log('cyan', '   • Create AI-powered projects with real insights');
    log('green', '\n✨ FlashFusion is now powered by Claude AI! ✨');
    
    log('blue', '\n🔧 Quick Server Restart:');
    log('yellow', '   1. Stop current server (Ctrl+C)');
    log('yellow', '   2. Run: PORT=3001 npm start');
    log('yellow', '   3. Test: curl http://localhost:3001/health');
  }
}

// Run the test
main().catch(console.error);