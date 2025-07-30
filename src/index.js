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
const { FlashFusionCore } = require('./core/FlashFusionCore');
const { AgentOrchestrator } = require('./core/AgentOrchestrator');
const { WorkflowEngine } = require('./core/WorkflowEngine');
const { UnifiedDashboard } = require('./api/UnifiedDashboard');

// Services
const databaseService = require('./services/database');
const aiService = require('./services/aiService');
const notionService = require('./services/notionService');
const zapierService = require('./services/zapierService');
const { PlatformIntegrationService } = require('./services/platformIntegrationService');

// Platform Integration Router
const platformRouter = require('../api/webhooks/platform-router');

// Configuration
const config = require('./config/environment');
const logger = require('./utils/logger');

class FlashFusionUnified {
    constructor() {
        this.app = express();
        this.core = new FlashFusionCore();
        this.orchestrator = new AgentOrchestrator();
        this.workflowEngine = new WorkflowEngine();
        this.dashboard = new UnifiedDashboard(this.orchestrator, this.workflowEngine);
        this.platformService = new PlatformIntegrationService();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupPlatformIntegration();
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
        this.app.use(morgan('combined'));
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Static files
        this.app.use(express.static(path.join(__dirname, '../client')));
        this.app.use('/assets', express.static(path.join(__dirname, '../assets')));
    }

    setupRoutes() {
        // API Routes
        this.app.use('/api/dashboard', this.dashboard.router);
        this.app.use('/api/agents', this.orchestrator.router);
        this.app.use('/api/workflows', this.workflowEngine.router);
        this.app.use('/api/database', databaseService.router);
        this.app.use('/api/ai', aiService.router);
        this.app.use('/api/notion', notionService.router);
        this.app.use('/api/zapier', zapierService.router);

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0',
                uptime: process.uptime(),
                platforms: this.platformService.getEnabledPlatforms().length
            });
        });

        // Root route
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/index.html'));
        });

        // Platform Integration Dashboard
        this.app.get('/platform-dashboard', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/platform-integration-dashboard.html'));
        });
    }

    setupPlatformIntegration() {
        // Mount platform webhook router
        this.app.use('/api/webhooks', platformRouter);

        // Set up platform event listeners
        this.platformService.on('platform_event_sent', (data) => {
            logger.info(`Platform event sent: ${data.platform} - ${data.event}`, {
                success: data.success,
                error: data.error
            });
        });

        this.platformService.on('event_failed', (eventData) => {
            logger.error(`Platform event failed after retries: ${eventData.event}`, {
                eventId: eventData.id,
                retries: eventData.retries
            });
        });

        // Initialize platform connections
        this.initializePlatformConnections();
    }

    async initializePlatformConnections() {
        logger.info('Initializing platform connections...');
        
        const enabledPlatforms = this.platformService.getEnabledPlatforms();
        logger.info(`Found ${enabledPlatforms.length} enabled platforms:`, 
            enabledPlatforms.map(p => p.name).join(', ')
        );

        // Test connections for critical platforms
        const criticalPlatforms = ['notion', 'github', 'zapier', 'firebase'];
        for (const platform of criticalPlatforms) {
            try {
                const result = await this.platformService.testPlatformConnection(platform);
                if (result.success) {
                    logger.info(`✅ ${platform} connection verified`);
                } else {
                    logger.warn(`⚠️ ${platform} connection failed: ${result.error}`);
                }
            } catch (error) {
                logger.error(`❌ ${platform} connection test error:`, error.message);
            }
        }

        // Set up automated event triggers
        this.setupAutomatedEventTriggers();
    }

    setupAutomatedEventTriggers() {
        // Trigger platform events based on internal system events
        this.core.on('workflow_completed', (data) => {
            this.platformService.queueEvent('workflow_completed', {
                workflowId: data.workflowId,
                type: data.type,
                duration: data.duration,
                results: data.results
            });
        });

        this.orchestrator.on('agent_action_completed', (data) => {
            this.platformService.queueEvent('agent_action_completed', {
                agentId: data.agentId,
                action: data.action,
                result: data.result,
                metadata: data.metadata
            });
        });

        // System health monitoring
        setInterval(() => {
            const healthData = {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                platforms: this.platformService.getEnabledPlatforms().length,
                timestamp: new Date().toISOString()
            };

            this.platformService.queueEvent('system_health_check', healthData, ['notion', 'firebase']);
        }, 300000); // Every 5 minutes
    }

    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: 'The requested resource was not found',
                path: req.path
            });
        });

        // Global error handler
        this.app.use((err, req, res, next) => {
            logger.error('Unhandled error:', err);
            
            // Send error event to platforms
            this.platformService.queueEvent('system_error', {
                error: err.message,
                stack: err.stack,
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            }, ['notion', 'zapier']);

            res.status(500).json({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
            });
        });
    }

    async start(port = process.env.PORT || 3000) {
        try {
            // Initialize core services
            await this.core.initialize();
            await this.orchestrator.initialize();
            await this.workflowEngine.initialize();

            // Start the server
            this.server = this.app.listen(port, () => {
                logger.info(`🚀 FlashFusion Unified Platform started on port ${port}`);
                logger.info(`📊 Dashboard: http://localhost:${port}`);
                logger.info(`🔗 Platform Integration: http://localhost:${port}/platform-dashboard`);
                logger.info(`🏥 Health Check: http://localhost:${port}/health`);
                
                // Send startup event to platforms
                this.platformService.queueEvent('system_startup', {
                    port,
                    timestamp: new Date().toISOString(),
                    version: process.env.npm_package_version || '1.0.0',
                    platforms: this.platformService.getEnabledPlatforms().length
                });
            });

            // Graceful shutdown
            process.on('SIGTERM', () => this.shutdown());
            process.on('SIGINT', () => this.shutdown());

        } catch (error) {
            logger.error('Failed to start FlashFusion:', error);
            process.exit(1);
        }
    }

    async shutdown() {
        logger.info('Shutting down FlashFusion...');
        
        // Send shutdown event to platforms
        this.platformService.queueEvent('system_shutdown', {
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });

        // Wait a moment for events to be sent
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (this.server) {
            this.server.close(() => {
                logger.info('FlashFusion shutdown complete');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    }
}

// Initialize and start the application
if (require.main === module) {
    const app = new FlashFusionUnified();
    app.start().catch(error => {
        logger.error('Failed to start application:', error);
        process.exit(1);
    });
}

module.exports = FlashFusionUnified;