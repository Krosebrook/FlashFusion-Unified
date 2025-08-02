#!/usr/bin/env node

/**
 * FlashFusion Simple API Test Server
 * Minimal test server without database dependencies
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'FlashFusion-Unified',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node_version: process.version
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  console.log('📊 API status requested');
  
  res.json({
    api: 'FlashFusion Unified API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/health',
      status: '/api/status',
      info: '/api',
      agents: '/api/agents/status',
      test: '/api/test'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Agent status simulation
app.get('/api/agents/status', (req, res) => {
  console.log('🤖 Agent status requested');
  
  res.json({
    orchestrator: {
      status: 'active',
      agents_registered: 9,
      active_agents: 7,
      total_tasks: 145,
      completed_tasks: 132,
      failed_tasks: 2,
      average_response_time: 250
    },
    agents: [
      { id: 'ui-agent-1', name: 'UI Development Agent', type: 'ui-agent', status: 'idle' },
      { id: 'figma-agent-1', name: 'Figma Integration Agent', type: 'figma-agent', status: 'idle' },
      { id: 'llm-agent-1', name: 'Multi-LLM Agent', type: 'llm-agent', status: 'busy' },
      { id: 'scraper-agent-1', name: 'Web Scraping Agent', type: 'scraper-agent', status: 'idle' },
      { id: 'workflow-agent-1', name: 'Workflow Automation Agent', type: 'workflow-agent', status: 'idle' },
      { id: 'database-agent-1', name: 'Database Management Agent', type: 'database-agent', status: 'idle' },
      { id: 'auth-agent-1', name: 'Authentication & Security Agent', type: 'auth-agent', status: 'idle' },
      { id: 'monitoring-agent-1', name: 'Monitoring & Analytics Agent', type: 'monitoring-agent', status: 'busy' },
      { id: 'app-creation-agent-1', name: 'AI App Creation Agent', type: 'app-creation-agent', status: 'idle' }
    ],
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for various API features
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint requested');
  
  res.json({
    message: 'FlashFusion API Test Successful',
    tests: {
      cors: 'enabled',
      json_parsing: 'enabled',
      routing: 'working',
      error_handling: 'configured'
    },
    server_info: {
      platform: process.platform,
      architecture: process.arch,
      node_version: process.version,
      uptime: process.uptime()
    },
    timestamp: new Date().toISOString()
  });
});

// POST test endpoint
app.post('/api/test', (req, res) => {
  console.log('🧪 POST test endpoint requested:', req.body);
  
  res.json({
    message: 'POST request successful',
    received_data: req.body,
    content_type: req.get('Content-Type'),
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'FlashFusion Unified API',
    version: '1.0.0',
    description: 'AI-powered application development platform',
    features: [
      'Multi-agent orchestration',
      'Database management',
      'Real-time communication',
      'Authentication system',
      'Code generation',
      'Deployment automation'
    ],
    endpoints: {
      health: 'GET /health - Server health check',
      status: 'GET /api/status - API operational status',
      agents: 'GET /api/agents/status - Agent orchestrator status',
      test: 'GET/POST /api/test - API functionality test'
    },
    documentation: 'https://docs.flashfusion.ai'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'GET /api/status',
      'GET /api/agents/status',
      'GET /api/test',
      'POST /api/test'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 FlashFusion API Test Server Started');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  console.log(`🤖 Agents: http://localhost:${PORT}/api/agents/status`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log('\n✅ Ready for API testing!\n');
});

export default app;