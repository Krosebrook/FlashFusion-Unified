/**
 * FlashFusion Debug Core
 * Central debugging and monitoring system that orchestrates all debug functionality
 */

const EventEmitter = require('events');
const { performance } = require('perf_hooks');

class DebugCore extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            level: options.level || process.env.DEBUG_LEVEL || 'info',
            enablePerformanceTracking: options.enablePerformanceTracking !== false,
            enableMemoryTracking: options.enableMemoryTracking !== false,
            enableRequestTracking: options.enableRequestTracking !== false,
            maxLogHistory: options.maxLogHistory || 10000,
            flushInterval: options.flushInterval || 30000, // 30 seconds
            ...options
        };

        this.state = {
            isEnabled: true,
            startTime: Date.now(),
            requestCount: 0,
            errorCount: 0,
            warningCount: 0,
            logHistory: [],
            performanceMetrics: new Map(),
            memorySnapshots: [],
            activeRequests: new Map()
        };

        this.loggers = new Map();
        this.monitors = new Map();
        this.analyzers = new Map();
        
        this.setupPerformanceTracking();
        this.setupMemoryTracking();
        this.setupCleanupInterval();
        
        // Emit startup event
        this.emit('debug:startup', {
            timestamp: new Date().toISOString(),
            config: this.config,
            pid: process.pid
        });
    }

    // Logger Management
    registerLogger(name, logger) {
        this.loggers.set(name, logger);
        this.emit('logger:registered', { name, logger });
        return this;
    }

    getLogger(name) {
        return this.loggers.get(name) || this.getDefaultLogger();
    }

    getDefaultLogger() {
        if (!this.loggers.has('default')) {
            const DefaultLogger = require('../loggers/DefaultLogger');
            this.registerLogger('default', new DefaultLogger(this));
        }
        return this.loggers.get('default');
    }

    // Monitor Management
    registerMonitor(name, monitor) {
        this.monitors.set(name, monitor);
        monitor.start && monitor.start();
        this.emit('monitor:registered', { name, monitor });
        return this;
    }

    getMonitor(name) {
        return this.monitors.get(name);
    }

    // Analyzer Management
    registerAnalyzer(name, analyzer) {
        this.analyzers.set(name, analyzer);
        this.emit('analyzer:registered', { name, analyzer });
        return this;
    }

    getAnalyzer(name) {
        return this.analyzers.get(name);
    }

    // Core Logging Methods
    log(level, component, message, data = null, options = {}) {
        if (!this.shouldLog(level)) return;

        const logEntry = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            data,
            pid: process.pid,
            memory: this.getCurrentMemoryUsage(),
            performance: this.getCurrentPerformanceMetrics(),
            ...options
        };

        // Add to history
        this.addToHistory(logEntry);

        // Update counters
        this.updateCounters(level);

        // Emit to all registered loggers
        this.loggers.forEach((logger, name) => {
            try {
                logger.log && logger.log(logEntry);
            } catch (error) {
                console.error(`Logger ${name} failed:`, error.message);
            }
        });

        // Emit event for external listeners
        this.emit('log', logEntry);
        this.emit(`log:${level}`, logEntry);

        return logEntry;
    }

    error(component, message, data = null, options = {}) {
        return this.log('error', component, message, data, options);
    }

    warn(component, message, data = null, options = {}) {
        return this.log('warn', component, message, data, options);
    }

    info(component, message, data = null, options = {}) {
        return this.log('info', component, message, data, options);
    }

    debug(component, message, data = null, options = {}) {
        return this.log('debug', component, message, data, options);
    }

    trace(component, message, data = null, options = {}) {
        return this.log('trace', component, message, data, options);
    }

    // Performance Tracking
    startTimer(name, metadata = {}) {
        const timerId = this.generateId();
        const timer = {
            id: timerId,
            name,
            startTime: performance.now(),
            startTimestamp: new Date().toISOString(),
            metadata
        };
        
        this.state.performanceMetrics.set(timerId, timer);
        this.emit('timer:start', timer);
        
        return timerId;
    }

    endTimer(timerId, additionalData = {}) {
        const timer = this.state.performanceMetrics.get(timerId);
        if (!timer) return null;

        const endTime = performance.now();
        const duration = endTime - timer.startTime;
        
        const result = {
            ...timer,
            endTime,
            endTimestamp: new Date().toISOString(),
            duration,
            ...additionalData
        };

        this.state.performanceMetrics.delete(timerId);
        this.emit('timer:end', result);
        
        this.log('debug', 'PERFORMANCE', `Timer ${timer.name} completed`, {
            duration: `${duration.toFixed(2)}ms`,
            ...result
        });

        return result;
    }

    // Request Tracking
    trackRequest(req, res, next) {
        const requestId = this.generateId();
        const startTime = performance.now();
        
        const requestData = {
            id: requestId,
            method: req.method,
            url: req.url,
            headers: req.headers,
            startTime,
            startTimestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress
        };

        this.state.activeRequests.set(requestId, requestData);
        this.state.requestCount++;

        // Add request ID to request object
        req.debugId = requestId;

        // Track response
        const originalSend = res.send;
        res.send = function(data) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            const responseData = {
                ...requestData,
                endTime,
                endTimestamp: new Date().toISOString(),
                duration,
                statusCode: res.statusCode,
                responseSize: Buffer.byteLength(data || '', 'utf8')
            };

            this.state.activeRequests.delete(requestId);
            this.emit('request:complete', responseData);
            
            this.log('info', 'REQUEST', `${req.method} ${req.url}`, {
                duration: `${duration.toFixed(2)}ms`,
                status: res.statusCode,
                size: responseData.responseSize
            });

            return originalSend.call(res, data);
        }.bind(this);

        this.emit('request:start', requestData);
        this.log('debug', 'REQUEST', `${req.method} ${req.url} started`, { requestId });

        if (next) next();
        return requestId;
    }

    // System Health
    getSystemHealth() {
        const memUsage = process.memoryUsage();
        const uptime = Date.now() - this.state.startTime;
        
        return {
            status: 'healthy', // TODO: Add health checks
            uptime,
            memory: {
                used: memUsage.heapUsed,
                total: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss
            },
            performance: {
                requestCount: this.state.requestCount,
                errorCount: this.state.errorCount,
                warningCount: this.state.warningCount,
                activeRequests: this.state.activeRequests.size,
                averageResponseTime: this.calculateAverageResponseTime()
            },
            loggers: Array.from(this.loggers.keys()),
            monitors: Array.from(this.monitors.keys()),
            analyzers: Array.from(this.analyzers.keys())
        };
    }

    // Utility Methods
    shouldLog(level) {
        const levels = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
        return levels[level] <= levels[this.config.level];
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    addToHistory(logEntry) {
        this.state.logHistory.push(logEntry);
        if (this.state.logHistory.length > this.config.maxLogHistory) {
            this.state.logHistory.shift();
        }
    }

    updateCounters(level) {
        if (level === 'error') this.state.errorCount++;
        if (level === 'warn') this.state.warningCount++;
    }

    getCurrentMemoryUsage() {
        if (!this.config.enableMemoryTracking) return null;
        return process.memoryUsage();
    }

    getCurrentPerformanceMetrics() {
        if (!this.config.enablePerformanceTracking) return null;
        return {
            uptime: Date.now() - this.state.startTime,
            activeTimers: this.state.performanceMetrics.size,
            activeRequests: this.state.activeRequests.size
        };
    }

    calculateAverageResponseTime() {
        // TODO: Implement response time calculation
        return 0;
    }

    setupPerformanceTracking() {
        if (!this.config.enablePerformanceTracking) return;
        
        // Track event loop lag
        setInterval(() => {
            const start = performance.now();
            setImmediate(() => {
                const lag = performance.now() - start;
                this.emit('performance:eventloop', { lag });
                
                if (lag > 100) { // Alert if lag > 100ms
                    this.warn('PERFORMANCE', 'High event loop lag detected', { lag: `${lag.toFixed(2)}ms` });
                }
            });
        }, 5000);
    }

    setupMemoryTracking() {
        if (!this.config.enableMemoryTracking) return;
        
        setInterval(() => {
            const memUsage = process.memoryUsage();
            this.state.memorySnapshots.push({
                timestamp: new Date().toISOString(),
                ...memUsage
            });
            
            // Keep only last 100 snapshots
            if (this.state.memorySnapshots.length > 100) {
                this.state.memorySnapshots.shift();
            }
            
            this.emit('memory:snapshot', memUsage);
            
            // Alert on high memory usage
            const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
            if (heapUsedMB > 500) { // Alert if heap > 500MB
                this.warn('MEMORY', 'High memory usage detected', { 
                    heapUsed: `${heapUsedMB.toFixed(2)}MB` 
                });
            }
        }, 10000);
    }

    setupCleanupInterval() {
        setInterval(() => {
            // Clean up old performance metrics
            const cutoff = performance.now() - 300000; // 5 minutes
            for (const [id, timer] of this.state.performanceMetrics) {
                if (timer.startTime < cutoff) {
                    this.state.performanceMetrics.delete(id);
                    this.warn('PERFORMANCE', 'Timer cleanup - orphaned timer removed', { timerId: id });
                }
            }
            
            // Clean up old requests
            const requestCutoff = performance.now() - 60000; // 1 minute
            for (const [id, request] of this.state.activeRequests) {
                if (request.startTime < requestCutoff) {
                    this.state.activeRequests.delete(id);
                    this.warn('REQUEST', 'Request cleanup - orphaned request removed', { requestId: id });
                }
            }
            
            this.emit('cleanup:complete', {
                removedTimers: 0, // TODO: Track actual removals
                removedRequests: 0
            });
        }, this.config.flushInterval);
    }

    // Shutdown
    async shutdown() {
        this.info('DEBUG_CORE', 'Shutting down debug system');
        
        // Stop all monitors
        for (const [name, monitor] of this.monitors) {
            try {
                monitor.stop && await monitor.stop();
            } catch (error) {
                this.error('DEBUG_CORE', `Failed to stop monitor ${name}`, error);
            }
        }
        
        // Final log flush
        this.emit('debug:shutdown', {
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.state.startTime,
            finalStats: this.getSystemHealth()
        });
        
        this.state.isEnabled = false;
    }
}

module.exports = DebugCore;