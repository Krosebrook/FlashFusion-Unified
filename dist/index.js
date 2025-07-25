/**
 * FlashFusion Unified Platform
 * Main entry point for the AI Business Operating System
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Core FlashFusion modules
const {
  FlashFusionCore
} = require('./core/FlashFusionCore');
const {
  AgentOrchestrator
} = require('./core/AgentOrchestrator');
const {
  WorkflowEngine
} = require('./core/WorkflowEngine');
const {
  UnifiedDashboard
} = require('./api/UnifiedDashboard');

// Configuration
const config = require('./config/environment');
const logger = require('./utils/logger');
class FlashFusionUnified {
  constructor() {
    this.app = express();
    this.core = new FlashFusionCore();
    this.orchestrator = new AgentOrchestrator();
    this.workflowEngine = new WorkflowEngine();
    this.dashboard = new UnifiedDashboard();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.ALLOWED_ORIGINS || ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));

    // Utility middleware
    this.app.use(compression());
    this.app.use(morgan('combined', {
      stream: {
        write: message => logger.info(message.trim())
      }
    }));
    this.app.use(express.json({
      limit: '10mb'
    }));
    this.app.use(express.urlencoded({
      extended: true,
      limit: '10mb'
    }));

    // Static files
    this.app.use(express.static(path.join(__dirname, '../client/dist')));
  }
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        version: config.APP_VERSION,
        timestamp: new Date().toISOString(),
        services: {
          core: this.core.isHealthy(),
          orchestrator: this.orchestrator.isHealthy(),
          workflowEngine: this.workflowEngine.isHealthy()
        }
      });
    });

    // API routes
    this.app.use('/api/v1', this.dashboard.getRouter());

    // Workflow routes
    this.app.use('/api/workflows', require('./api/routes/workflows'));

    // Agent routes
    this.app.use('/api/agents', require('./api/routes/agents'));

    // Integration routes
    this.app.use('/api/integrations', require('./api/routes/integrations'));

    // Analytics routes
    this.app.use('/api/analytics', require('./api/routes/analytics'));

    // Serve React app for all other routes
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }
  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      logger.error('Unhandled error:', err);
      res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: config.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString(),
        ...(config.NODE_ENV === 'development' && {
          stack: err.stack
        })
      });
    });
  }
  async initialize() {
    try {
      logger.info('🚀 Initializing FlashFusion Unified Platform...');

      // Initialize core services
      await this.core.initialize();
      logger.info('✅ Core services initialized');

      // Initialize agent orchestrator
      await this.orchestrator.initialize();
      logger.info('✅ Agent orchestrator initialized');

      // Initialize workflow engine
      await this.workflowEngine.initialize();
      logger.info('✅ Workflow engine initialized');

      // Initialize dashboard
      await this.dashboard.initialize();
      logger.info('✅ Unified dashboard initialized');
      logger.info('🎉 FlashFusion Unified Platform ready!');
    } catch (error) {
      logger.error('❌ Failed to initialize FlashFusion:', error);
      throw error;
    }
  }
  async start(port = config.PORT || 3000) {
    try {
      await this.initialize();
      this.server = this.app.listen(port, () => {
        logger.info(`🌟 FlashFusion Unified Platform running on port ${port}`);
        logger.info(`📊 Dashboard: http://localhost:${port}`);
        logger.info(`🔍 Health check: http://localhost:${port}/health`);
        logger.info(`📚 API docs: http://localhost:${port}/api/docs`);
      });

      // Graceful shutdown handling
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
    } catch (error) {
      logger.error('❌ Failed to start FlashFusion:', error);
      process.exit(1);
    }
  }
  async shutdown() {
    logger.info('🛑 Shutting down FlashFusion Unified Platform...');
    try {
      // Close server
      if (this.server) {
        await new Promise(resolve => this.server.close(resolve));
      }

      // Cleanup services
      await this.workflowEngine.shutdown();
      await this.orchestrator.shutdown();
      await this.core.shutdown();
      logger.info('✅ FlashFusion shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Export for testing
module.exports = FlashFusionUnified;

// Start server if this file is run directly
if (require.main === module) {
  const platform = new FlashFusionUnified();
  platform.start();
}