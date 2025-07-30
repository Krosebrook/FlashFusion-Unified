/**
 * System Health Monitor
 * Monitors system health metrics and alerts on issues
 */

const EventEmitter = require('events');
const { performance } = require('perf_hooks');
const os = require('os');

class SystemHealthMonitor extends EventEmitter {
    constructor(debugCore, options = {}) {
        super();
        
        this.debugCore = debugCore;
        this.config = {
            checkInterval: options.checkInterval || 10000, // 10 seconds
            memoryThreshold: options.memoryThreshold || 500, // MB
            cpuThreshold: options.cpuThreshold || 80, // %
            diskThreshold: options.diskThreshold || 90, // %
            eventLoopLagThreshold: options.eventLoopLagThreshold || 100, // ms
            enableCpuMonitoring: options.enableCpuMonitoring !== false,
            enableMemoryMonitoring: options.enableMemoryMonitoring !== false,
            enableDiskMonitoring: options.enableDiskMonitoring !== false,
            enableNetworkMonitoring: options.enableNetworkMonitoring !== false,
            ...options
        };

        this.state = {
            isRunning: false,
            lastCheck: null,
            checkCount: 0,
            alerts: [],
            metrics: {
                memory: [],
                cpu: [],
                eventLoop: [],
                disk: [],
                network: []
            }
        };

        this.intervals = new Map();
        this.cpuUsage = null;
        this.networkStats = null;
    }

    start() {
        if (this.state.isRunning) return;
        
        this.state.isRunning = true;
        this.state.lastCheck = Date.now();
        
        this.debugCore.info('HEALTH_MONITOR', 'Starting system health monitoring', {
            interval: this.config.checkInterval,
            thresholds: {
                memory: this.config.memoryThreshold,
                cpu: this.config.cpuThreshold,
                eventLoop: this.config.eventLoopLagThreshold
            }
        });

        // Start monitoring intervals
        this.startMemoryMonitoring();
        this.startCpuMonitoring();
        this.startEventLoopMonitoring();
        this.startDiskMonitoring();
        this.startNetworkMonitoring();
        
        // Main health check interval
        this.intervals.set('healthCheck', setInterval(() => {
            this.performHealthCheck();
        }, this.config.checkInterval));

        this.emit('monitor:started');
    }

    stop() {
        if (!this.state.isRunning) return;
        
        this.state.isRunning = false;
        
        // Clear all intervals
        for (const [name, interval] of this.intervals) {
            clearInterval(interval);
        }
        this.intervals.clear();
        
        this.debugCore.info('HEALTH_MONITOR', 'Stopped system health monitoring');
        this.emit('monitor:stopped');
    }

    startMemoryMonitoring() {
        if (!this.config.enableMemoryMonitoring) return;

        this.intervals.set('memory', setInterval(() => {
            const memUsage = process.memoryUsage();
            const systemMem = {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem()
            };

            const metrics = {
                timestamp: new Date().toISOString(),
                process: {
                    heapUsed: memUsage.heapUsed,
                    heapTotal: memUsage.heapTotal,
                    external: memUsage.external,
                    rss: memUsage.rss,
                    heapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
                    heapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2)
                },
                system: {
                    totalMB: (systemMem.total / 1024 / 1024).toFixed(2),
                    freeMB: (systemMem.free / 1024 / 1024).toFixed(2),
                    usedMB: (systemMem.used / 1024 / 1024).toFixed(2),
                    usagePercent: ((systemMem.used / systemMem.total) * 100).toFixed(2)
                }
            };

            this.addMetric('memory', metrics);

            // Check thresholds
            const heapUsedMB = parseFloat(metrics.process.heapUsedMB);
            if (heapUsedMB > this.config.memoryThreshold) {
                this.createAlert('memory', 'high_heap_usage', {
                    current: heapUsedMB,
                    threshold: this.config.memoryThreshold,
                    message: `Process heap usage is ${heapUsedMB}MB (threshold: ${this.config.memoryThreshold}MB)`
                });
            }

            this.emit('memory:update', metrics);
        }, 5000)); // Every 5 seconds
    }

    startCpuMonitoring() {
        if (!this.config.enableCpuMonitoring) return;

        // Initialize CPU usage tracking
        this.cpuUsage = process.cpuUsage();
        
        this.intervals.set('cpu', setInterval(() => {
            const cpuUsage = process.cpuUsage(this.cpuUsage);
            const systemLoad = os.loadavg();
            const cpuCount = os.cpus().length;

            // Calculate CPU percentage
            const totalUsage = cpuUsage.user + cpuUsage.system;
            const totalTime = totalUsage / 1000000; // Convert to seconds
            const cpuPercent = (totalTime / (this.config.checkInterval / 1000)) * 100;

            const metrics = {
                timestamp: new Date().toISOString(),
                process: {
                    user: cpuUsage.user,
                    system: cpuUsage.system,
                    total: totalUsage,
                    percent: cpuPercent.toFixed(2)
                },
                system: {
                    loadAvg1: systemLoad[0].toFixed(2),
                    loadAvg5: systemLoad[1].toFixed(2),
                    loadAvg15: systemLoad[2].toFixed(2),
                    cpuCount,
                    loadPercent: ((systemLoad[0] / cpuCount) * 100).toFixed(2)
                }
            };

            this.addMetric('cpu', metrics);
            this.cpuUsage = process.cpuUsage(); // Reset for next measurement

            // Check thresholds
            if (cpuPercent > this.config.cpuThreshold) {
                this.createAlert('cpu', 'high_cpu_usage', {
                    current: cpuPercent.toFixed(2),
                    threshold: this.config.cpuThreshold,
                    message: `CPU usage is ${cpuPercent.toFixed(2)}% (threshold: ${this.config.cpuThreshold}%)`
                });
            }

            this.emit('cpu:update', metrics);
        }, this.config.checkInterval));
    }

    startEventLoopMonitoring() {
        this.intervals.set('eventLoop', setInterval(() => {
            const start = performance.now();
            setImmediate(() => {
                const lag = performance.now() - start;
                
                const metrics = {
                    timestamp: new Date().toISOString(),
                    lag: lag.toFixed(2),
                    lagMs: lag
                };

                this.addMetric('eventLoop', metrics);

                // Check threshold
                if (lag > this.config.eventLoopLagThreshold) {
                    this.createAlert('eventLoop', 'high_event_loop_lag', {
                        current: lag.toFixed(2),
                        threshold: this.config.eventLoopLagThreshold,
                        message: `Event loop lag is ${lag.toFixed(2)}ms (threshold: ${this.config.eventLoopLagThreshold}ms)`
                    });
                }

                this.emit('eventLoop:update', metrics);
            });
        }, 5000));
    }

    startDiskMonitoring() {
        if (!this.config.enableDiskMonitoring) return;
        
        // Note: Basic disk monitoring - would need additional libraries for detailed disk stats
        this.intervals.set('disk', setInterval(() => {
            // For now, just monitor process working directory
            // In production, you might want to use libraries like 'node-disk-info'
            const metrics = {
                timestamp: new Date().toISOString(),
                cwd: process.cwd(),
                // Placeholder for disk metrics
                available: null,
                used: null,
                total: null
            };

            this.addMetric('disk', metrics);
            this.emit('disk:update', metrics);
        }, 30000)); // Every 30 seconds
    }

    startNetworkMonitoring() {
        if (!this.config.enableNetworkMonitoring) return;

        this.intervals.set('network', setInterval(() => {
            const networkInterfaces = os.networkInterfaces();
            
            const metrics = {
                timestamp: new Date().toISOString(),
                interfaces: Object.keys(networkInterfaces).length,
                // Basic network interface info
                details: Object.entries(networkInterfaces).map(([name, interfaces]) => ({
                    name,
                    addresses: interfaces.map(iface => ({
                        address: iface.address,
                        family: iface.family,
                        internal: iface.internal
                    }))
                }))
            };

            this.addMetric('network', metrics);
            this.emit('network:update', metrics);
        }, 60000)); // Every minute
    }

    performHealthCheck() {
        this.state.checkCount++;
        this.state.lastCheck = Date.now();

        const health = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            pid: process.pid,
            version: process.version,
            platform: process.platform,
            arch: process.arch,
            checkCount: this.state.checkCount,
            alerts: this.getActiveAlerts(),
            status: this.calculateOverallStatus()
        };

        this.debugCore.debug('HEALTH_MONITOR', 'Health check completed', {
            status: health.status,
            alerts: health.alerts.length,
            uptime: `${Math.floor(health.uptime / 60)}m ${Math.floor(health.uptime % 60)}s`
        });

        this.emit('health:check', health);
        return health;
    }

    addMetric(type, metric) {
        const metrics = this.state.metrics[type];
        if (metrics) {
            metrics.push(metric);
            
            // Keep only last 100 metrics per type
            if (metrics.length > 100) {
                metrics.shift();
            }
        }
    }

    createAlert(category, type, data) {
        const alert = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            category,
            type,
            severity: this.getAlertSeverity(category, type),
            data,
            acknowledged: false,
            resolved: false
        };

        this.state.alerts.push(alert);
        
        // Keep only last 1000 alerts
        if (this.state.alerts.length > 1000) {
            this.state.alerts.shift();
        }

        this.debugCore.warn('HEALTH_MONITOR', `Alert created: ${alert.type}`, alert.data);
        this.emit('alert:created', alert);
        
        return alert;
    }

    getAlertSeverity(category, type) {
        const severityMap = {
            memory: { high_heap_usage: 'warning' },
            cpu: { high_cpu_usage: 'warning' },
            eventLoop: { high_event_loop_lag: 'critical' },
            disk: { low_disk_space: 'critical' },
            network: { connection_issues: 'warning' }
        };

        return severityMap[category]?.[type] || 'info';
    }

    getActiveAlerts() {
        return this.state.alerts.filter(alert => !alert.resolved);
    }

    acknowledgeAlert(alertId) {
        const alert = this.state.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = new Date().toISOString();
            this.emit('alert:acknowledged', alert);
        }
        return alert;
    }

    resolveAlert(alertId) {
        const alert = this.state.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = new Date().toISOString();
            this.emit('alert:resolved', alert);
        }
        return alert;
    }

    calculateOverallStatus() {
        const activeAlerts = this.getActiveAlerts();
        
        if (activeAlerts.some(a => a.severity === 'critical')) {
            return 'critical';
        }
        
        if (activeAlerts.some(a => a.severity === 'warning')) {
            return 'warning';
        }
        
        return 'healthy';
    }

    getMetrics(type = null, limit = 50) {
        if (type) {
            return this.state.metrics[type]?.slice(-limit) || [];
        }
        
        const result = {};
        for (const [metricType, metrics] of Object.entries(this.state.metrics)) {
            result[metricType] = metrics.slice(-limit);
        }
        return result;
    }

    getSystemSummary() {
        const latestMetrics = {};
        for (const [type, metrics] of Object.entries(this.state.metrics)) {
            if (metrics.length > 0) {
                latestMetrics[type] = metrics[metrics.length - 1];
            }
        }

        return {
            status: this.calculateOverallStatus(),
            uptime: process.uptime(),
            lastCheck: this.state.lastCheck,
            checkCount: this.state.checkCount,
            activeAlerts: this.getActiveAlerts().length,
            totalAlerts: this.state.alerts.length,
            metrics: latestMetrics,
            isMonitoring: this.state.isRunning
        };
    }
}

module.exports = SystemHealthMonitor;