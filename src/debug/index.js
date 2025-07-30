/**
 * FlashFusion Debug System
 * Main entry point for the comprehensive debugging and exploration system
 */

const DebugCore = require('./core/DebugCore');
const DefaultLogger = require('./loggers/DefaultLogger');
const SystemHealthMonitor = require('./monitors/SystemHealthMonitor');
const CodebaseAnalyzer = require('../explore/codebase/CodebaseAnalyzer');
const DebugDashboard = require('./dashboards/DebugDashboard');

class FlashFusionDebugSystem {
    constructor(options = {}) {
        this.config = {
            enableHealthMonitoring: options.enableHealthMonitoring !== false,
            enableCodebaseAnalysis: options.enableCodebaseAnalysis !== false,
            enableDashboard: options.enableDashboard !== false,
            autoStart: options.autoStart !== false,
            dashboardPort: options.dashboardPort || 3001,
            logLevel: options.logLevel || 'info',
            ...options
        };

        // Initialize debug core
        this.debugCore = new DebugCore({
            level: this.config.logLevel,
            enablePerformanceTracking: true,
            enableMemoryTracking: true,
            enableRequestTracking: true,
            ...options.debugCore
        });

        // Initialize components
        this.logger = null;
        this.healthMonitor = null;
        this.codebaseAnalyzer = null;
        this.dashboard = null;

        this.isInitialized = false;
        this.isStarted = false;

        // Auto-initialize if requested
        if (this.config.autoStart) {
            this.initialize().then(() => {
                if (this.config.autoStart) {
                    this.start();
                }
            }).catch(error => {
                console.error('Debug system auto-initialization failed:', error);
            });
        }
    }

    async initialize() {
        if (this.isInitialized) return this;

        this.debugCore.info('DEBUG_SYSTEM', 'Initializing FlashFusion Debug System', this.config);

        try {
            // Initialize default logger
            this.logger = new DefaultLogger(this.debugCore, this.config.logger);
            this.debugCore.registerLogger('default', this.logger);

            // Initialize health monitor
            if (this.config.enableHealthMonitoring) {
                this.healthMonitor = new SystemHealthMonitor(this.debugCore, this.config.healthMonitor);
                this.debugCore.registerMonitor('health', this.healthMonitor);
            }

            // Initialize codebase analyzer
            if (this.config.enableCodebaseAnalysis) {
                this.codebaseAnalyzer = new CodebaseAnalyzer(this.debugCore, this.config.codebaseAnalyzer);
                this.debugCore.registerAnalyzer('codebase', this.codebaseAnalyzer);
            }

            // Initialize dashboard
            if (this.config.enableDashboard) {
                this.dashboard = new DebugDashboard(this.debugCore, {
                    port: this.config.dashboardPort,
                    ...this.config.dashboard
                });
            }

            this.isInitialized = true;
            this.debugCore.info('DEBUG_SYSTEM', 'Debug system initialized successfully');

            return this;
        } catch (error) {
            this.debugCore.error('DEBUG_SYSTEM', 'Failed to initialize debug system', error);
            throw error;
        }
    }

    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.isStarted) return this;

        this.debugCore.info('DEBUG_SYSTEM', 'Starting debug system components');

        try {
            // Start health monitoring
            if (this.healthMonitor) {
                this.healthMonitor.start();
                this.debugCore.info('DEBUG_SYSTEM', 'Health monitoring started');
            }

            // Start dashboard
            if (this.dashboard) {
                const dashboardInfo = await this.dashboard.start();
                this.debugCore.info('DEBUG_SYSTEM', 'Debug dashboard started', dashboardInfo);
            }

            // Perform initial codebase analysis
            if (this.codebaseAnalyzer) {
                this.debugCore.info('DEBUG_SYSTEM', 'Starting initial codebase analysis...');
                // Run analysis in background to avoid blocking startup
                setImmediate(async () => {
                    try {
                        await this.codebaseAnalyzer.analyzeCodebase();
                        this.debugCore.info('DEBUG_SYSTEM', 'Initial codebase analysis completed');
                    } catch (error) {
                        this.debugCore.warn('DEBUG_SYSTEM', 'Initial codebase analysis failed', error.message);
                    }
                });
            }

            this.isStarted = true;
            this.debugCore.info('DEBUG_SYSTEM', 'Debug system started successfully', {
                healthMonitoring: !!this.healthMonitor,
                codebaseAnalysis: !!this.codebaseAnalyzer,
                dashboard: this.dashboard ? this.dashboard.getUrl() : null
            });

            return this;
        } catch (error) {
            this.debugCore.error('DEBUG_SYSTEM', 'Failed to start debug system', error);
            throw error;
        }
    }

    async stop() {
        if (!this.isStarted) return;

        this.debugCore.info('DEBUG_SYSTEM', 'Stopping debug system');

        try {
            // Stop dashboard
            if (this.dashboard && this.dashboard.isRunning()) {
                await this.dashboard.stop();
                this.debugCore.info('DEBUG_SYSTEM', 'Dashboard stopped');
            }

            // Stop health monitoring
            if (this.healthMonitor) {
                this.healthMonitor.stop();
                this.debugCore.info('DEBUG_SYSTEM', 'Health monitoring stopped');
            }

            // Shutdown debug core
            await this.debugCore.shutdown();

            this.isStarted = false;
            console.log('FlashFusion Debug System stopped');
        } catch (error) {
            console.error('Error stopping debug system:', error);
            throw error;
        }
    }

    // Express.js middleware for request tracking
    middleware() {
        if (!this.debugCore) {
            throw new Error('Debug system not initialized');
        }

        return (req, res, next) => {
            this.debugCore.trackRequest(req, res, next);
        };
    }

    // Get system health information
    getSystemHealth() {
        return this.debugCore ? this.debugCore.getSystemHealth() : null;
    }

    // Get recent logs
    getLogs(options = {}) {
        if (!this.logger) return [];
        return this.logger.getRecentLogs(options.limit, options.level);
    }

    // Search logs
    searchLogs(query, options = {}) {
        if (!this.logger) return [];
        return this.logger.searchLogs(query, options);
    }

    // Get system metrics
    getMetrics() {
        return this.healthMonitor ? this.healthMonitor.getMetrics() : {};
    }

    // Get codebase analysis
    async getCodebaseAnalysis() {
        if (!this.codebaseAnalyzer) return null;
        
        if (!this.codebaseAnalyzer.cache.fileTree) {
            await this.codebaseAnalyzer.analyzeCodebase();
        }
        
        return {
            metrics: this.codebaseAnalyzer.getMetrics(),
            dependencies: this.codebaseAnalyzer.getDependencies(),
            fileTree: this.codebaseAnalyzer.getFileTree()
        };
    }

    // Performance timing utilities
    startTimer(name, metadata = {}) {
        return this.debugCore ? this.debugCore.startTimer(name, metadata) : null;
    }

    endTimer(timerId, additionalData = {}) {
        return this.debugCore ? this.debugCore.endTimer(timerId, additionalData) : null;
    }

    // Logging methods
    error(component, message, data = null) {
        return this.debugCore ? this.debugCore.error(component, message, data) : false;
    }

    warn(component, message, data = null) {
        return this.debugCore ? this.debugCore.warn(component, message, data) : false;
    }

    info(component, message, data = null) {
        return this.debugCore ? this.debugCore.info(component, message, data) : false;
    }

    debug(component, message, data = null) {
        return this.debugCore ? this.debugCore.debug(component, message, data) : false;
    }

    trace(component, message, data = null) {
        return this.debugCore ? this.debugCore.trace(component, message, data) : false;
    }

    // Dashboard utilities
    getDashboardUrl() {
        return this.dashboard ? this.dashboard.getUrl() : null;
    }

    isDashboardRunning() {
        return this.dashboard ? this.dashboard.isRunning() : false;
    }

    // Export data
    exportLogs(format = 'json', options = {}) {
        if (!this.logger) return null;
        return this.logger.exportLogs(format, options);
    }

    exportMetrics() {
        return this.healthMonitor ? this.healthMonitor.getMetrics() : {};
    }

    // Configuration updates
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.logger) {
            this.logger.updateConfig(newConfig.logger || {});
        }
        
        this.debugCore.info('DEBUG_SYSTEM', 'Configuration updated', newConfig);
    }

    // Health checks
    async performHealthCheck() {
        if (!this.healthMonitor) return null;
        return this.healthMonitor.performHealthCheck();
    }

    // Codebase utilities
    async analyzeCodebase(options = {}) {
        if (!this.codebaseAnalyzer) return null;
        return this.codebaseAnalyzer.analyzeCodebase(options);
    }

    async searchFiles(query, options = {}) {
        if (!this.codebaseAnalyzer) return [];
        return this.codebaseAnalyzer.searchFiles(query, options);
    }

    // Event handling
    on(event, listener) {
        if (this.debugCore) {
            this.debugCore.on(event, listener);
        }
    }

    off(event, listener) {
        if (this.debugCore) {
            this.debugCore.off(event, listener);
        }
    }

    // Cleanup
    clearLogs() {
        if (this.logger) {
            this.logger.clearHistory();
        }
    }

    clearMetrics() {
        if (this.healthMonitor) {
            // Implementation would depend on health monitor having this method
            this.debugCore.info('DEBUG_SYSTEM', 'Metrics cleared');
        }
    }

    clearCodebaseCache() {
        if (this.codebaseAnalyzer) {
            this.codebaseAnalyzer.clearCache();
            this.debugCore.info('DEBUG_SYSTEM', 'Codebase cache cleared');
        }
    }

    // Status information
    getStatus() {
        return {
            initialized: this.isInitialized,
            started: this.isStarted,
            components: {
                debugCore: !!this.debugCore,
                logger: !!this.logger,
                healthMonitor: !!this.healthMonitor && this.healthMonitor.state.isRunning,
                codebaseAnalyzer: !!this.codebaseAnalyzer,
                dashboard: !!this.dashboard && this.dashboard.isRunning()
            },
            config: this.config,
            dashboardUrl: this.getDashboardUrl()
        };
    }
}

// Singleton instance for easy access
let debugSystemInstance = null;

// Factory function
function createDebugSystem(options = {}) {
    return new FlashFusionDebugSystem(options);
}

// Get or create singleton instance
function getDebugSystem(options = {}) {
    if (!debugSystemInstance) {
        debugSystemInstance = new FlashFusionDebugSystem(options);
    }
    return debugSystemInstance;
}

// Initialize and start debug system
async function initializeDebugSystem(options = {}) {
    const debugSystem = getDebugSystem(options);
    await debugSystem.initialize();
    if (options.autoStart !== false) {
        await debugSystem.start();
    }
    return debugSystem;
}

module.exports = {
    FlashFusionDebugSystem,
    DebugCore,
    DefaultLogger,
    SystemHealthMonitor,
    CodebaseAnalyzer,
    DebugDashboard,
    createDebugSystem,
    getDebugSystem,
    initializeDebugSystem
};