/**
 * FlashFusion Enhanced Platform
 * Main entry point with 7-Feature Digital Product Orchestration System
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import IntegrationManager from './agents/integration-manager.js';
import AgentRouter from './agents/agent-router.js';
import healthRouter from './routes/health.js';
import './sentry.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Integration Manager with all 7 features
const integrationManager = new IntegrationManager();
let agentRouter;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'FlashFusion Enhanced Platform - Complete Digital Product Orchestration',
    version: '2.0.0-enhanced',
    status: 'running',
    features: [
      '🔄 Real-time Agent Communication & Handoff System',
      '⚡ Dynamic Role Selection & Load Balancing', 
      '📊 Performance Monitoring & Analytics Dashboard',
      '🔐 Secure Credential Management & API Integration',
      '🧠 Context Persistence & Memory Management',
      '🛡️ Error Handling & Resilience System',
      '📈 Workflow State Management & Progress Tracking'
    ],
    capabilities: {
      agents: 11,
      workflows: 6,
      realTimeUI: true,
      multiLLM: true,
      figmaIntegration: true,
      webScraping: true
    }
  });
});

// Health check with enhanced monitoring
app.use('/health', healthRouter);

// Integration Manager dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const dashboard = await integrationManager.getRealTimeDashboard();
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced status endpoint
app.get('/api/status/enhanced', async (req, res) => {
  try {
    const status = await integrationManager.getIntegratedStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product development endpoint
app.post('/api/product/develop', async (req, res) => {
  try {
    const { projectId, description, priority, context } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    const task = {
      projectId: projectId || `project_${Date.now()}`,
      description,
      priority: priority || 5,
      context: context || {},
      type: 'product_development'
    };

    const result = await integrationManager.orchestrator.executeEnhancedTask(task);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Workflow visualization endpoint
app.get('/api/workflow/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const visualization = await integrationManager.getWorkflowVisualization(projectId);
    res.json(visualization);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Agent handoff endpoint
app.post('/api/agents/handoff', async (req, res) => {
  try {
    const { fromAgent, toAgent, deliverables, projectId } = req.body;
    
    if (!fromAgent || !toAgent || !deliverables) {
      return res.status(400).json({ error: 'fromAgent, toAgent, and deliverables are required' });
    }
    
    const handoffId = await integrationManager.initiateHandoffWithUI(
      fromAgent, 
      toAgent, 
      deliverables, 
      projectId
    );
    res.json({ handoffId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complex workflow execution endpoint
app.post('/api/workflow/execute', async (req, res) => {
  try {
    const workflowDefinition = req.body;
    
    if (!workflowDefinition.name || !workflowDefinition.phases) {
      return res.status(400).json({ error: 'Workflow name and phases are required' });
    }
    
    const result = await integrationManager.executeComplexWorkflow(workflowDefinition);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Context management endpoints
app.post('/api/context/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { context, source } = req.body;
    
    const result = await integrationManager.orchestrator.storeContext(projectId, context, source);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/context/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const context = await integrationManager.orchestrator.getContext(projectId);
    
    if (!context) {
      return res.status(404).json({ error: 'Context not found' });
    }
    
    res.json(context);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example workflow templates
app.get('/api/workflow/templates', (req, res) => {
  const templates = [
    {
      id: 'mobile_app_development',
      name: 'Mobile App Development',
      description: 'Complete mobile app development workflow',
      phases: [
        {
          name: 'discovery',
          parallel: false,
          tasks: [
            { description: 'Market research and user personas', type: 'research' },
            { description: 'Technical feasibility analysis', type: 'analysis' }
          ]
        },
        {
          name: 'design',
          parallel: true,
          tasks: [
            { description: 'Create wireframes and user flows', type: 'design' },
            { description: 'Design visual mockups', type: 'design' }
          ]
        },
        {
          name: 'build',
          parallel: false,
          tasks: [
            { description: 'Implement mobile frontend', type: 'development' },
            { description: 'Build backend APIs', type: 'development' },
            { description: 'Integrate third-party services', type: 'integration' }
          ]
        }
      ]
    },
    {
      id: 'web_platform_launch',
      name: 'Web Platform Launch',
      description: 'End-to-end web platform development and launch',
      phases: [
        {
          name: 'planning',
          parallel: false,
          tasks: [
            { description: 'Define product strategy', type: 'strategy' },
            { description: 'Create project roadmap', type: 'planning' }
          ]
        },
        {
          name: 'development',
          parallel: true,
          tasks: [
            { description: 'Frontend development', type: 'development' },
            { description: 'Backend development', type: 'development' },
            { description: 'Database design', type: 'database' }
          ]
        },
        {
          name: 'launch',
          parallel: false,
          tasks: [
            { description: 'Quality assurance testing', type: 'testing' },
            { description: 'Production deployment', type: 'deployment' },
            { description: 'Marketing campaign launch', type: 'marketing' }
          ]
        }
      ]
    }
  ];
  
  res.json(templates);
});

// Initialize and start server
async function startEnhancedServer() {
  try {
    console.log('🚀 Initializing FlashFusion Enhanced System...');
    console.log('📋 Features: 7-Feature Digital Product Orchestration');
    
    // Initialize Integration Manager with all 7 features
    await integrationManager.initialize();
    console.log('✅ Integration Manager initialized');
    
    // Initialize Agent Router
    agentRouter = new AgentRouter();
    app.use('/api/agents', agentRouter.getRouter());
    console.log('✅ Agent Router initialized');
    
    console.log('🎯 All enhanced systems ready!');
    
    server.listen(PORT, () => {
      console.log('');
      console.log('🌟 ==========================================');
      console.log('🌟 FlashFusion Enhanced Platform Running!');
      console.log('🌟 ==========================================');
      console.log(`📊 Main Server: http://localhost:${PORT}`);
      console.log(`📈 Dashboard: http://localhost:${PORT}/api/dashboard`);
      console.log(`🔄 Real-time UI: http://localhost:3001`);
      console.log(`🤖 Agent API: http://localhost:${PORT}/api/agents`);
      console.log(`⚡ Enhanced Status: http://localhost:${PORT}/api/status/enhanced`);
      console.log(`📋 Workflow Templates: http://localhost:${PORT}/api/workflow/templates`);
      console.log('');
      console.log('🎯 Ready for Digital Product Orchestration!');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Failed to start enhanced server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n🔄 Received ${signal}. Shutting down gracefully...`);
  
  try {
    await integrationManager.shutdown();
    console.log('✅ Integration Manager shut down');
    
    if (agentRouter) {
      await agentRouter.shutdown();
      console.log('✅ Agent Router shut down');
    }
    
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
    
    // Force exit after 30 seconds
    setTimeout(() => {
      console.error('❌ Forced exit after timeout');
      process.exit(1);
    }, 30000);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the enhanced server
startEnhancedServer();