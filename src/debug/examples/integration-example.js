/**
 * FlashFusion Debug System Integration Example
 * Shows how to integrate the debug system with the main FlashFusion application
 */

const express = require('express');
const { initializeDebugSystem } = require('../index');

async function createFlashFusionWithDebug() {
    // Initialize the debug system first
    const debugSystem = await initializeDebugSystem({
        logLevel: process.env.DEBUG_LEVEL || 'info',
        dashboardPort: process.env.DEBUG_PORT || 3001,
        enableHealthMonitoring: true,
        enableCodebaseAnalysis: true,
        enableDashboard: process.env.NODE_ENV !== 'production',
        
        // Custom configuration for different components
        healthMonitor: {
            checkInterval: 15000,        // Check every 15 seconds
            memoryThreshold: 512,        // Alert at 512MB
            cpuThreshold: 75,           // Alert at 75% CPU
            eventLoopLagThreshold: 50,  // Alert at 50ms lag
        },
        
        logger: {
            includeMemory: true,        // Include memory info in logs
            includePerformance: true,   // Include performance metrics
            colorize: process.env.NODE_ENV !== 'production'
        },
        
        dashboard: {
            enableAuth: process.env.DASHBOARD_AUTH === 'true',
            authToken: process.env.DASHBOARD_TOKEN,
            updateInterval: 2000        // Update every 2 seconds
        }
    });

    // Create Express app
    const app = express();
    
    // Add debug middleware early in the stack
    app.use(debugSystem.middleware());
    
    // Standard middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Example: Integrate with existing FlashFusion modules
    const { FlashFusionCore } = require('../core/FlashFusionCore');
    const { AgentOrchestrator } = require('../core/AgentOrchestrator');
    
    // Initialize FlashFusion components with debug integration
    const flashFusionCore = new FlashFusionCore();
    const agentOrchestrator = new AgentOrchestrator();
    
    // Add debug logging to FlashFusion components
    const originalLog = console.log;
    console.log = (...args) => {
        debugSystem.info('FLASHFUSION', args.join(' '));
        originalLog.apply(console, args);
    };
    
    const originalError = console.error;
    console.error = (...args) => {
        debugSystem.error('FLASHFUSION', args.join(' '));
        originalError.apply(console, args);
    };

    // Routes with debug integration
    app.get('/', (req, res) => {
        const timerId = debugSystem.startTimer('home_page_render');
        
        debugSystem.info('ROUTE', 'Home page accessed', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        try {
            res.json({
                message: 'FlashFusion API with Debug System',
                timestamp: new Date().toISOString(),
                debugDashboard: debugSystem.getDashboardUrl(),
                systemHealth: debugSystem.getSystemHealth()
            });
            
            debugSystem.endTimer(timerId, { success: true });
        } catch (error) {
            debugSystem.error('ROUTE', 'Home page error', error);
            debugSystem.endTimer(timerId, { success: false, error: error.message });
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Health check endpoint
    app.get('/health', async (req, res) => {
        const timerId = debugSystem.startTimer('health_check');
        
        try {
            const health = await debugSystem.performHealthCheck();
            debugSystem.endTimer(timerId, { success: true });
            
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                debug: health,
                components: {
                    flashFusionCore: !!flashFusionCore,
                    agentOrchestrator: !!agentOrchestrator,
                    debugSystem: debugSystem.getStatus()
                }
            });
        } catch (error) {
            debugSystem.error('HEALTH', 'Health check failed', error);
            debugSystem.endTimer(timerId, { success: false, error: error.message });
            res.status(500).json({ error: 'Health check failed' });
        }
    });

    // Agent orchestration with debug tracking
    app.post('/agents/execute', async (req, res) => {
        const timerId = debugSystem.startTimer('agent_execution', {
            agentType: req.body.type,
            requestId: req.debugId
        });
        
        debugSystem.info('AGENT', 'Agent execution requested', {
            type: req.body.type,
            payload: req.body.payload
        });
        
        try {
            // Simulate agent execution
            const result = await agentOrchestrator.execute(req.body.type, req.body.payload);
            
            debugSystem.info('AGENT', 'Agent execution completed', {
                type: req.body.type,
                success: true,
                resultSize: JSON.stringify(result).length
            });
            
            debugSystem.endTimer(timerId, { 
                success: true, 
                resultSize: JSON.stringify(result).length 
            });
            
            res.json({ success: true, result });
        } catch (error) {
            debugSystem.error('AGENT', 'Agent execution failed', {
                type: req.body.type,
                error: error.message,
                stack: error.stack
            });
            
            debugSystem.endTimer(timerId, { success: false, error: error.message });
            res.status(500).json({ error: 'Agent execution failed' });
        }
    });

    // Codebase analysis endpoint
    app.get('/debug/codebase', async (req, res) => {
        const timerId = debugSystem.startTimer('codebase_analysis');
        
        try {
            debugSystem.info('DEBUG', 'Codebase analysis requested');
            const analysis = await debugSystem.getCodebaseAnalysis();
            
            debugSystem.endTimer(timerId, { 
                filesAnalyzed: analysis?.metrics?.totalFiles || 0 
            });
            
            res.json(analysis);
        } catch (error) {
            debugSystem.error('DEBUG', 'Codebase analysis failed', error);
            debugSystem.endTimer(timerId, { success: false, error: error.message });
            res.status(500).json({ error: 'Analysis failed' });
        }
    });

    // Debug logs endpoint
    app.get('/debug/logs', (req, res) => {
        const { level, component, limit = 100, search } = req.query;
        
        debugSystem.debug('DEBUG', 'Logs requested', { level, component, limit, search });
        
        try {
            let logs;
            if (search) {
                logs = debugSystem.searchLogs(search, { level, component, limit: parseInt(limit) });
            } else {
                logs = debugSystem.getLogs({ level, limit: parseInt(limit) });
            }
            
            res.json({
                logs,
                total: logs.length,
                filters: { level, component, search }
            });
        } catch (error) {
            debugSystem.error('DEBUG', 'Log retrieval failed', error);
            res.status(500).json({ error: 'Log retrieval failed' });
        }
    });

    // Performance metrics endpoint
    app.get('/debug/metrics', (req, res) => {
        try {
            const metrics = debugSystem.getMetrics();
            res.json({
                timestamp: new Date().toISOString(),
                metrics,
                summary: {
                    totalRequests: debugSystem.getSystemHealth().performance?.requestCount || 0,
                    memoryUsage: process.memoryUsage(),
                    uptime: process.uptime()
                }
            });
        } catch (error) {
            debugSystem.error('DEBUG', 'Metrics retrieval failed', error);
            res.status(500).json({ error: 'Metrics retrieval failed' });
        }
    });

    // Error handling middleware with debug integration
    app.use((error, req, res, next) => {
        debugSystem.error('EXPRESS', 'Unhandled error', {
            error: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method,
            body: req.body,
            query: req.query
        });
        
        res.status(500).json({
            error: 'Internal server error',
            requestId: req.debugId,
            timestamp: new Date().toISOString()
        });
    });

    // 404 handler with debug logging
    app.use((req, res) => {
        debugSystem.warn('EXPRESS', '404 - Route not found', {
            path: req.path,
            method: req.method,
            ip: req.ip
        });
        
        res.status(404).json({
            error: 'Route not found',
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    });

    // Listen to debug system events for custom handling
    debugSystem.on('alert:created', (alert) => {
        console.log(`🚨 System Alert [${alert.severity.toUpperCase()}]: ${alert.data.message}`);
        
        // In production, you might want to send alerts to external services
        if (alert.severity === 'critical') {
            // sendToSlack(alert);
            // sendToEmail(alert);
            // createJiraTicket(alert);
        }
    });

    debugSystem.on('log', (logEntry) => {
        // Custom log processing
        if (logEntry.level === 'error' && logEntry.component === 'DATABASE') {
            // Handle database errors specially
            console.log('Database error detected, checking connection...');
        }
    });

    // Graceful shutdown with debug system cleanup
    const gracefulShutdown = async (signal) => {
        console.log(`\n${signal} received. Starting graceful shutdown...`);
        
        debugSystem.info('SYSTEM', 'Graceful shutdown initiated', { signal });
        
        try {
            // Stop accepting new requests
            server.close(async () => {
                debugSystem.info('SYSTEM', 'HTTP server closed');
                
                // Stop debug system
                await debugSystem.stop();
                
                // Close other connections (database, etc.)
                // await database.close();
                
                console.log('Graceful shutdown completed');
                process.exit(0);
            });
            
            // Force shutdown after 30 seconds
            setTimeout(() => {
                debugSystem.error('SYSTEM', 'Forced shutdown - timeout exceeded');
                process.exit(1);
            }, 30000);
            
        } catch (error) {
            debugSystem.error('SYSTEM', 'Shutdown error', error);
            process.exit(1);
        }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions and rejections
    process.on('uncaughtException', (error) => {
        debugSystem.error('SYSTEM', 'Uncaught exception', {
            error: error.message,
            stack: error.stack
        });
        
        // In production, you might want to restart the process
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        debugSystem.error('SYSTEM', 'Unhandled promise rejection', {
            reason: reason?.message || reason,
            promise: promise.toString()
        });
    });

    return { app, debugSystem, flashFusionCore, agentOrchestrator };
}

// Example usage
async function startFlashFusionServer() {
    try {
        const { app, debugSystem } = await createFlashFusionWithDebug();
        
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`🚀 FlashFusion server running on port ${PORT}`);
            console.log(`🔧 Debug dashboard: ${debugSystem.getDashboardUrl()}`);
            console.log(`📊 System health: ${debugSystem.getSystemHealth().status}`);
            
            debugSystem.info('SYSTEM', 'FlashFusion server started', {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                debugDashboard: debugSystem.getDashboardUrl()
            });
        });

        // Store server reference for graceful shutdown
        global.server = server;
        
        return { server, debugSystem };
    } catch (error) {
        console.error('Failed to start FlashFusion server:', error);
        process.exit(1);
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    startFlashFusionServer().catch(console.error);
}

module.exports = {
    createFlashFusionWithDebug,
    startFlashFusionServer
};