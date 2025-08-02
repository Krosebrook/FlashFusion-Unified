#!/usr/bin/env node

/**
 * FlashFusion API Test Server
 * Simple test server for API endpoint verification
 */

import express from 'express';
import cors from 'cors';
import { db } from './src/database/supabase.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    console.log('🏥 Health check requested');
    
    // Basic health
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'FlashFusion-Unified'
    };

    // Test database if configured
    if (process.env.SUPABASE_URL) {
      try {
        const dbHealth = await db.healthCheck();
        health.database = dbHealth;
      } catch (dbError) {
        health.database = { 
          status: 'unhealthy', 
          error: dbError.message,
          note: 'Database connection not configured or unavailable'
        };
      }
    } else {
      health.database = { 
        status: 'not_configured',
        note: 'SUPABASE_URL not provided'
      };
    }

    res.json(health);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    api: 'FlashFusion Unified API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/health',
      status: '/api/status',
      database: '/api/database/test'
    },
    timestamp: new Date().toISOString()
  });
});

// Database test endpoint
app.get('/api/database/test', async (req, res) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'SUPABASE_URL and SUPABASE_ANON_KEY environment variables required',
        status: 'not_configured'
      });
    }

    console.log('🗄️ Testing database connection...');
    const result = await db.healthCheck();
    
    res.json({
      database: 'Supabase',
      status: result.status,
      timestamp: result.timestamp,
      message: 'Database connection test successful'
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message,
      status: 'error'
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'FlashFusion Unified API',
    version: '1.0.0',
    description: 'AI-powered application development platform',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      status: '/api/status',
      database: '/api/database/test'
    },
    features: [
      'Multi-agent orchestration',
      'Database management',
      'Real-time communication',
      'Authentication system',
      'Code generation',
      'Deployment automation'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.originalUrl} not found`,
    availableEndpoints: ['/health', '/api', '/api/status', '/api/database/test']
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
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API status: http://localhost:${PORT}/api/status`);
  console.log(`🗄️ Database test: http://localhost:${PORT}/api/database/test`);
  console.log('\n✅ Ready for API testing!');
});

export default app;