/**
 * FlashFusion Complete Backend Server
 * Optimized for Vercel deployment
 */

import 'dotenv/config';
import { initSentry, setupSentryMiddleware, setupSentryErrorHandler } from './sentry.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import winston from 'winston';
import AgentOrchestrator from './agents/orchestrator.js';
import { db } from './database/supabase.js';

// Initialize Sentry as early as possible
initSentry();

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'logs/backend.log' })
    ]
});

// Initialize Express app
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.IO
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST']
    }
});

// Initialize services  
let orchestrator = null;
let servicesStatus = {
    server: 'starting',
    database: 'unknown',
    orchestrator: 'not_initialized',
    websocket: 'not_initialized'
};

// Initialize Agent Orchestrator
async function initializeOrchestrator() {
    try {
        orchestrator = new AgentOrchestrator();
        
        // Register default agents
        await orchestrator.createAgent('ui-agent', {
            socketUrl: `ws://localhost:${PORT}`
        });
        
        await orchestrator.createAgent('llm-agent', {
            defaultModel: 'claude'
        });
        
        await orchestrator.createAgent('workflow-agent', {
            maxRetries: 3
        });
        
        await orchestrator.createAgent('app-creation-agent', {});
        
        logger.info('✅ Agent Orchestrator initialized with default agents');
        servicesStatus.orchestrator = 'active';
        
        return orchestrator;
    } catch (error) {
        logger.error('Failed to initialize orchestrator:', error);
        servicesStatus.orchestrator = 'error';
        return null;
    }
}

// Middleware
// Sentry request handler must be first
setupSentryMiddleware(app);

app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        services: servicesStatus,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    };

    // Test database connection
    if (process.env.SUPABASE_URL) {
        try {
            const dbHealth = await db.healthCheck();
            health.services.database = dbHealth.status;
        } catch (error) {
            health.services.database = 'error';
        }
    } else {
        health.services.database = 'not_configured';
    }

    res.json(health);
});

// Sentry test endpoint
app.get('/api/test-sentry', async (req, res) => {
    try {
        // Test Sentry message capture
        const { captureMessage, captureException } = await import('./sentry.js');
        
        captureMessage('Sentry test message from FlashFusion', 'info', {
            test: true,
            timestamp: new Date().toISOString(),
            endpoint: '/api/test-sentry'
        });

        res.json({
            success: true,
            message: 'Sentry test message sent successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Sentry error test endpoint
app.get('/api/test-sentry-error', async (req, res) => {
    try {
        const { captureException } = await import('./sentry.js');
        
        // Intentionally throw an error to test Sentry
        const testError = new Error('This is a test error for Sentry monitoring');
        testError.context = {
            test: true,
            endpoint: '/api/test-sentry-error',
            timestamp: new Date().toISOString()
        };
        
        captureException(testError, {
            user: { id: 'test-user', email: 'test@flashfusion.co' },
            extra: { testData: 'Sentry error tracking test' }
        });
        
        throw testError; // This will trigger Sentry's error handler middleware
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error sent to Sentry for tracking'
        });
    }
});

// API Routes
app.get('/api', (req, res) => {
    res.json({
        name: 'FlashFusion Backend API',
        version: '2.0.0',
        features: [
            '🤖 Multi-Agent Orchestration',
            '📊 Real-time Analytics',
            '🔐 Secure Authentication',
            '⚡ WebSocket Communication',
            '🗄️ Database Management',
            '🚀 Deployment Automation'
        ],
        endpoints: {
            health: '/health',
            agents: '/api/agents',
            tasks: '/api/tasks',
            projects: '/api/projects',
            deployments: '/api/deployments'
        }
    });
});

// Agent management endpoints
app.get('/api/agents', (req, res) => {
    if (!orchestrator) {
        return res.status(503).json({ error: 'Orchestrator not initialized' });
    }
    
    const status = orchestrator.getStatus();
    res.json(status);
});

app.post('/api/agents/:type', async (req, res) => {
    if (!orchestrator) {
        return res.status(503).json({ error: 'Orchestrator not initialized' });
    }
    
    try {
        const { type } = req.params;
        const config = req.body;
        const agentId = await orchestrator.createAgent(type, config);
        
        res.json({
            success: true,
            agentId,
            message: `Agent ${type} created successfully`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Task execution endpoint
app.post('/api/tasks', async (req, res) => {
    if (!orchestrator) {
        return res.status(503).json({ error: 'Orchestrator not initialized' });
    }
    
    try {
        const task = req.body;
        const result = await orchestrator.executeTask(task);
        
        res.json({
            success: true,
            result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Project management endpoints (database integration)
app.get('/api/projects', async (req, res) => {
    try {
        // Mock user ID for testing
        const userId = req.headers['x-user-id'] || 'test-user-id';
        
        if (!process.env.SUPABASE_URL) {
            // Return mock data if database not configured
            return res.json({
                projects: [
                    {
                        id: '1',
                        name: 'Test Project',
                        status: 'active',
                        created_at: new Date().toISOString()
                    }
                ]
            });
        }
        
        const projects = await db.getUserProjects(userId);
        res.json({ projects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// WebSocket connections
io.on('connection', (socket) => {
    logger.info('New WebSocket connection:', socket.id);
    servicesStatus.websocket = 'connected';
    
    socket.on('agent:status', async () => {
        if (orchestrator) {
            const status = orchestrator.getStatus();
            socket.emit('agent:status:update', status);
        }
    });
    
    socket.on('task:execute', async (taskData) => {
        if (!orchestrator) {
            socket.emit('task:error', { error: 'Orchestrator not initialized' });
            return;
        }
        
        try {
            const result = await orchestrator.executeTask(taskData);
            socket.emit('task:complete', result);
        } catch (error) {
            socket.emit('task:error', { error: error.message });
        }
    });
    
    socket.on('disconnect', () => {
        logger.info('WebSocket disconnected:', socket.id);
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.originalUrl} not found`,
        suggestion: 'Check /api for available endpoints'
    });
});

// Sentry error handler must be before any other error middleware
setupSentryErrorHandler(app);

// Error handler
app.use((error, req, res, next) => {
    logger.error('Server error:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
    });
});

// Start server
async function startServer() {
    try {
        logger.info('🚀 Starting FlashFusion Backend Server...');
        
        // Initialize services
        // Redis not needed for Vercel deployment
        await initializeOrchestrator();
        
        // Start listening
        server.listen(PORT, () => {
            servicesStatus.server = 'running';
            logger.info(`✅ Backend server running on http://localhost:${PORT}`);
            logger.info(`📊 Health check: http://localhost:${PORT}/health`);
            logger.info(`🤖 Agent status: http://localhost:${PORT}/api/agents`);
            logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
            
            // Log service status
            logger.info('Service Status:', servicesStatus);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    
    if (orchestrator) {
        await orchestrator.shutdown();
    }
    
    // No Redis cleanup needed for Vercel
    
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

// Start the server
startServer();