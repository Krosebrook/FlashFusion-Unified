#!/usr/bin/env node

// Health Check Script
// Tests all services and provides comprehensive status report

require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  purple: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function healthCheck() {
  log('\n🏥 FlashFusion Health Check', 'cyan');
  log('=' .repeat(50), 'blue');

  const services = [];
  let totalServices = 0;
  let healthyServices = 0;

  // Environment validation
  log('\n🔧 Environment Check:', 'yellow');
  try {
    const { validateEnvironment } = require('./validate_env.js');
    const envValid = validateEnvironment();
    services.push({
      name: 'Environment Configuration',
      status: envValid ? 'healthy' : 'unhealthy',
      details: envValid ? 'All required variables configured' : 'Missing or invalid configuration'
    });
    totalServices++;
    if (envValid) healthyServices++;
  } catch (error) {
    log(`  ❌ Environment validation failed: ${error.message}`, 'red');
    services.push({
      name: 'Environment Configuration',
      status: 'unhealthy',
      details: error.message
    });
    totalServices++;
  }

  // API Key Service Check
  log('\n🔑 API Key Service:', 'yellow');
  try {
    // Dynamically import to handle potential missing files
    const apiKeyService = await import('../server/services/apiKeyService.ts').catch(() => null);
    
    if (apiKeyService && apiKeyService.SecureApiKeyService) {
      const configValid = apiKeyService.SecureApiKeyService.validateEnvironmentConfig();
      services.push({
        name: 'API Key Service',
        status: configValid ? 'healthy' : 'degraded',
        details: configValid ? 'All API keys configured' : 'Some API keys missing'
      });
      log(`  ${configValid ? '✅' : '⚠️'} API Key Service: ${configValid ? 'Healthy' : 'Degraded'}`, configValid ? 'green' : 'yellow');
    } else {
      services.push({
        name: 'API Key Service',
        status: 'unhealthy',
        details: 'Service not available'
      });
      log(`  ❌ API Key Service: Not available`, 'red');
    }
    totalServices++;
    if (services[services.length - 1].status === 'healthy') healthyServices++;
  } catch (error) {
    log(`  ❌ API Key Service check failed: ${error.message}`, 'red');
    services.push({
      name: 'API Key Service',
      status: 'unhealthy',
      details: error.message
    });
    totalServices++;
  }

  // AI Service Check
  log('\n🤖 AI Services:', 'yellow');
  try {
    const aiService = await import('../server/services/ai.ts').catch(() => null);
    
    if (aiService && aiService.SecureAIService) {
      const aiHealth = await aiService.SecureAIService.healthCheck();
      services.push({
        name: 'AI Service',
        status: aiHealth.status,
        details: `Providers: ${Object.keys(aiHealth.providers).join(', ')}`
      });
      
      const statusIcon = aiHealth.status === 'healthy' ? '✅' : aiHealth.status === 'degraded' ? '⚠️' : '❌';
      const statusColor = aiHealth.status === 'healthy' ? 'green' : aiHealth.status === 'degraded' ? 'yellow' : 'red';
      log(`  ${statusIcon} AI Service: ${aiHealth.status}`, statusColor);
      
      // Log provider details
      Object.entries(aiHealth.providers).forEach(([provider, status]) => {
        const icon = status ? '✅' : '❌';
        const color = status ? 'green' : 'red';
        log(`    ${icon} ${provider}: ${status ? 'Available' : 'Unavailable'}`, color);
      });
      
      if (aiHealth.errors.length > 0) {
        log(`    Errors: ${aiHealth.errors.join(', ')}`, 'red');
      }
    } else {
      services.push({
        name: 'AI Service',
        status: 'unhealthy',
        details: 'Service not available'
      });
      log(`  ❌ AI Service: Not available`, 'red');
    }
    totalServices++;
    if (services[services.length - 1].status === 'healthy') healthyServices++;
  } catch (error) {
    log(`  ❌ AI Service check failed: ${error.message}`, 'red');
    services.push({
      name: 'AI Service',
      status: 'unhealthy',
      details: error.message
    });
    totalServices++;
  }

  // Database Connection Check (Supabase)
  log('\n🗄️  Database:', 'yellow');
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      // Simple connectivity test
      const supabaseUrl = process.env.SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      });
      
      const dbHealthy = response.status === 200 || response.status === 404; // 404 is OK for root endpoint
      services.push({
        name: 'Database (Supabase)',
        status: dbHealthy ? 'healthy' : 'unhealthy',
        details: `Response: ${response.status}`
      });
      
      log(`  ${dbHealthy ? '✅' : '❌'} Supabase: ${dbHealthy ? 'Connected' : 'Connection failed'}`, dbHealthy ? 'green' : 'red');
      totalServices++;
      if (dbHealthy) healthyServices++;
    } catch (error) {
      services.push({
        name: 'Database (Supabase)',
        status: 'unhealthy',
        details: error.message
      });
      log(`  ❌ Supabase: ${error.message}`, 'red');
      totalServices++;
    }
  } else {
    services.push({
      name: 'Database (Supabase)',
      status: 'unhealthy',
      details: 'Not configured'
    });
    log(`  ❌ Supabase: Not configured`, 'red');
    totalServices++;
  }

  // MCP Services Check
  log('\n🔄 MCP Services:', 'yellow');
  try {
    const mcpWrapper = await import('../server/services/mcp/MCPWrapper.ts').catch(() => null);
    
    if (mcpWrapper && mcpWrapper.MCPWrapper) {
      const mcpInstance = mcpWrapper.MCPWrapper.getInstance();
      const mcpStatus = mcpInstance.getStatus();
      
      services.push({
        name: 'MCP Governance',
        status: 'healthy',
        details: `Token usage: ${mcpStatus.tokenUsage}/${mcpStatus.tokenLimit}`
      });
      
      log(`  ✅ MCP Governance: Active`, 'green');
      log(`    Token usage: ${mcpStatus.tokenUsage}/${mcpStatus.tokenLimit}`, 'blue');
      log(`    Checkpoints: ${mcpStatus.checkpointCount}`, 'blue');
      log(`    Pending approvals: ${mcpStatus.pendingApprovals}`, 'blue');
      
      totalServices++;
      healthyServices++;
    } else {
      services.push({
        name: 'MCP Governance',
        status: 'degraded',
        details: 'Service not initialized'
      });
      log(`  ⚠️  MCP Governance: Not initialized`, 'yellow');
      totalServices++;
    }
  } catch (error) {
    services.push({
      name: 'MCP Governance',
      status: 'unhealthy',
      details: error.message
    });
    log(`  ❌ MCP Governance: ${error.message}`, 'red');
    totalServices++;
  }

  // Overall Status
  log('\n📊 Overall Status:', 'cyan');
  const overallHealth = healthyServices / totalServices;
  let overallStatus = 'unhealthy';
  let statusColor = 'red';
  let statusIcon = '❌';

  if (overallHealth >= 0.8) {
    overallStatus = 'healthy';
    statusColor = 'green';
    statusIcon = '✅';
  } else if (overallHealth >= 0.5) {
    overallStatus = 'degraded';
    statusColor = 'yellow';
    statusIcon = '⚠️';
  }

  log(`  ${statusIcon} System Status: ${overallStatus.toUpperCase()}`, statusColor);
  log(`  Services: ${healthyServices}/${totalServices} healthy (${Math.round(overallHealth * 100)}%)`, statusColor);

  // Recommendations
  if (overallHealth < 1.0) {
    log('\n💡 Recommendations:', 'purple');
    services.forEach(service => {
      if (service.status !== 'healthy') {
        log(`  • Fix ${service.name}: ${service.details}`, 'yellow');
      }
    });
  }

  log('\n🎯 Next Steps:', 'cyan');
  if (overallHealth < 0.5) {
    log('  1. Fix critical configuration issues', 'red');
    log('  2. Verify API keys are correctly set', 'red');
    log('  3. Check network connectivity', 'red');
  } else if (overallHealth < 1.0) {
    log('  1. Address degraded services', 'yellow');
    log('  2. Verify optional API keys', 'yellow');
    log('  3. Test end-to-end functionality', 'yellow');
  } else {
    log('  🚀 All systems operational! Ready for production.', 'green');
  }

  return {
    overallStatus,
    healthyServices,
    totalServices,
    services
  };
}

// Run health check if called directly
if (require.main === module) {
  healthCheck().then(result => {
    process.exit(result.overallStatus === 'healthy' ? 0 : 1);
  }).catch(error => {
    log(`\n❌ Health check failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { healthCheck };