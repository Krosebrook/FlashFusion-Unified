/**
 * Debug Dashboard
 * Web-based interface for real-time debugging and system monitoring
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

class DebugDashboard {
    constructor(debugCore, options = {}) {
        this.debugCore = debugCore;
        this.config = {
            port: options.port || 3001,
            host: options.host || 'localhost',
            enableAuth: options.enableAuth === true,
            authToken: options.authToken || null,
            enableWebSocket: options.enableWebSocket !== false,
            updateInterval: options.updateInterval || 1000,
            maxClients: options.maxClients || 10,
            ...options
        };

        this.app = express();
        this.server = http.createServer(this.app);
        this.io = this.config.enableWebSocket ? socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        }) : null;

        this.state = {
            isRunning: false,
            connectedClients: new Set(),
            startTime: null,
            requestCount: 0
        };

        this.setupMiddleware();<CRLF>
        this.setupRoutes();
        this.setupWebSocket();
        this.setupEventListeners();
    }

    setupMiddleware() {
        // Basic middleware
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
        
        // CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            next();
        });

        // Request tracking
        this.app.use((req, res, next) => {
            this.state.requestCount++;
            req.startTime = Date.now();
            
            // Log dashboard requests
            this.debugCore.debug('DEBUG_DASHBOARD', `${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            next();
        });

        // Authentication middleware (if enabled)
        if (this.config.enableAuth) {
            this.app.use(this.authMiddleware.bind(this));
        }
    }

    setupRoutes() {
        // Main dashboard page
        this.app.get('/', (req, res) => {
            res.send(this.generateDashboardHTML());
        });

        // API Routes
        this.app.get('/api/health', this.handleHealthCheck.bind(this));
        this.app.get('/api/system', this.handleSystemInfo.bind(this));
        this.app.get('/api/logs', this.handleGetLogs.bind(this));
        this.app.get('/api/metrics', this.handleGetMetrics.bind(this));
        this.app.get('/api/alerts', this.handleGetAlerts.bind(this));
        this.app.get('/api/codebase', this.handleCodebaseInfo.bind(this));
        
        // Control endpoints
        this.app.post('/api/logs/clear', this.handleClearLogs.bind(this));
        this.app.post('/api/alerts/:id/acknowledge', this.handleAcknowledgeAlert.bind(this));
        this.app.post('/api/alerts/:id/resolve', this.handleResolveAlert.bind(this));
        this.app.post('/api/system/gc', this.handleGarbageCollect.bind(this));
        
        // Export endpoints
        this.app.get('/api/export/logs', this.handleExportLogs.bind(this));
        this.app.get('/api/export/metrics', this.handleExportMetrics.bind(this));

        // Error handling
        this.app.use(this.errorHandler.bind(this));
    }

    setupWebSocket() {
        if (!this.io) return;

        this.io.on('connection', (socket) => {
            this.state.connectedClients.add(socket);
            
            this.debugCore.info('DEBUG_DASHBOARD', 'Client connected', {
                socketId: socket.id,
                totalClients: this.state.connectedClients.size
            });

            // Send initial data
            socket.emit('system:info', this.getSystemInfo());
            socket.emit('health:status', this.debugCore.getSystemHealth());

            // Handle client requests
            socket.on('logs:subscribe', (options) => {
                this.handleLogsSubscription(socket, options);
            });

            socket.on('metrics:subscribe', (options) => {
                this.handleMetricsSubscription(socket, options);
            });

            socket.on('disconnect', () => {
                this.state.connectedClients.delete(socket);
                this.debugCore.info('DEBUG_DASHBOARD', 'Client disconnected', {
                    socketId: socket.id,
                    totalClients: this.state.connectedClients.size
                });
            });
        });

        // Broadcast updates to all clients
        setInterval(() => {
            if (this.state.connectedClients.size > 0) {
                this.broadcastUpdates();
            }
        }, this.config.updateInterval);
    }

    setupEventListeners() {
        // Listen to debug core events
        this.debugCore.on('log', (logEntry) => {
            this.broadcastToClients('log:new', logEntry);
        });

        this.debugCore.on('alert:created', (alert) => {
            this.broadcastToClients('alert:new', alert);
        });

        this.debugCore.on('memory:snapshot', (snapshot) => {
            this.broadcastToClients('memory:update', snapshot);
        });

        this.debugCore.on('performance:eventloop', (data) => {
            this.broadcastToClients('performance:eventloop', data);
        });

        // Listen to health monitor events
        const healthMonitor = this.debugCore.getMonitor('health');
        if (healthMonitor) {
            healthMonitor.on('health:check', (health) => {
                this.broadcastToClients('health:update', health);
            });
        }
    }

    authMiddleware(req, res, next) {
        if (req.path.startsWith('/api/')) {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token || token !== this.config.authToken) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }
        next();
    }

    // Route Handlers
    async handleHealthCheck(req, res) {
        try {
            const health = this.debugCore.getSystemHealth();
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                dashboard: {
                    uptime: Date.now() - this.state.startTime,
                    connectedClients: this.state.connectedClients.size,
                    requestCount: this.state.requestCount
                },
                system: health
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleSystemInfo(req, res) {
        try {
            const systemInfo = this.getSystemInfo();
            res.json(systemInfo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleGetLogs(req, res) {
        try {
            const {
                level = null,
                component = null,
                limit = 100,
                offset = 0,
                search = null
            } = req.query;

            const logger = this.debugCore.getLogger('default');
            let logs = logger.getRecentLogs(parseInt(limit) + parseInt(offset), level);
            
            // Apply filters
            if (component) {
                logs = logs.filter(log => log.component === component);
            }
            
            if (search) {
                logs = logs.filter(log => 
                    log.message.toLowerCase().includes(search.toLowerCase()) ||
                    (log.data && JSON.stringify(log.data).toLowerCase().includes(search.toLowerCase()))
                );
            }

            // Apply pagination
            logs = logs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

            res.json({
                logs,
                total: logs.length,
                filters: { level, component, search },
                pagination: { limit: parseInt(limit), offset: parseInt(offset) }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleGetMetrics(req, res) {
        try {
            const healthMonitor = this.debugCore.getMonitor('health');
            const metrics = healthMonitor ? healthMonitor.getMetrics() : {};
            
            res.json({
                timestamp: new Date().toISOString(),
                metrics,
                summary: healthMonitor ? healthMonitor.getSystemSummary() : null
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleGetAlerts(req, res) {
        try {
            const healthMonitor = this.debugCore.getMonitor('health');
            const alerts = healthMonitor ? healthMonitor.getActiveAlerts() : [];
            
            res.json({
                alerts,
                total: alerts.length,
                summary: {
                    critical: alerts.filter(a => a.severity === 'critical').length,
                    warning: alerts.filter(a => a.severity === 'warning').length,
                    info: alerts.filter(a => a.severity === 'info').length
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleCodebaseInfo(req, res) {
        try {
            const analyzer = this.debugCore.getAnalyzer('codebase');
            if (!analyzer) {
                return res.status(404).json({ error: 'Codebase analyzer not available' });
            }

            const metrics = analyzer.getMetrics();
            const dependencies = analyzer.getDependencies();
            
            res.json({
                metrics,
                dependencies,
                lastScan: analyzer.cache.lastScan
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleClearLogs(req, res) {
        try {
            const logger = this.debugCore.getLogger('default');
            logger.clearHistory();
            
            this.debugCore.info('DEBUG_DASHBOARD', 'Logs cleared via dashboard');
            res.json({ success: true, message: 'Logs cleared' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleAcknowledgeAlert(req, res) {
        try {
            const { id } = req.params;
            const healthMonitor = this.debugCore.getMonitor('health');
            
            if (!healthMonitor) {
                return res.status(404).json({ error: 'Health monitor not available' });
            }

            const alert = healthMonitor.acknowledgeAlert(id);
            if (!alert) {
                return res.status(404).json({ error: 'Alert not found' });
            }

            res.json({ success: true, alert });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleResolveAlert(req, res) {
        try {
            const { id } = req.params;
            const healthMonitor = this.debugCore.getMonitor('health');
            
            if (!healthMonitor) {
                return res.status(404).json({ error: 'Health monitor not available' });
            }

            const alert = healthMonitor.resolveAlert(id);
            if (!alert) {
                return res.status(404).json({ error: 'Alert not found' });
            }

            res.json({ success: true, alert });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleGarbageCollect(req, res) {
        try {
            if (global.gc) {
                global.gc();
                this.debugCore.info('DEBUG_DASHBOARD', 'Garbage collection triggered via dashboard');
                res.json({ success: true, message: 'Garbage collection triggered' });
            } else {
                res.status(400).json({ error: 'Garbage collection not available (run with --expose-gc)' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleExportLogs(req, res) {
        try {
            const { format = 'json', level = null, limit = 1000 } = req.query;
            const logger = this.debugCore.getLogger('default');
            
            const exportData = logger.exportLogs(format, { level, limit: parseInt(limit) });
            
            const filename = `logs-${new Date().toISOString().split('T')[0]}.${format}`;
            
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', this.getContentType(format));
            res.send(exportData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleExportMetrics(req, res) {
        try {
            const healthMonitor = this.debugCore.getMonitor('health');
            const metrics = healthMonitor ? healthMonitor.getMetrics() : {};
            
            const filename = `metrics-${new Date().toISOString().split('T')[0]}.json`;
            
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'application/json');
            res.json(metrics);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    errorHandler(error, req, res, next) {
        this.debugCore.error('DEBUG_DASHBOARD', 'Request error', {
            error: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method
        });

        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }

    // Utility Methods
    getSystemInfo() {
        return {
            timestamp: new Date().toISOString(),
            process: {
                pid: process.pid,
                version: process.version,
                platform: process.platform,
                arch: process.arch,
                uptime: process.uptime(),
                cwd: process.cwd()
            },
            memory: process.memoryUsage(),
            dashboard: {
                uptime: this.state.startTime ? Date.now() - this.state.startTime : 0,
                connectedClients: this.state.connectedClients.size,
                requestCount: this.state.requestCount,
                config: {
                    port: this.config.port,
                    host: this.config.host,
                    enableAuth: this.config.enableAuth,
                    enableWebSocket: this.config.enableWebSocket
                }
            }
        };
    }

    broadcastUpdates() {
        if (!this.io) return;

        const updates = {
            timestamp: new Date().toISOString(),
            system: this.debugCore.getSystemHealth(),
            memory: process.memoryUsage()
        };

        this.io.emit('system:update', updates);
    }

    broadcastToClients(event, data) {
        if (!this.io) return;
        this.io.emit(event, data);
    }

    handleLogsSubscription(socket, options) {
        // Implementation for real-time log streaming
        const logger = this.debugCore.getLogger('default');
        const logs = logger.getRecentLogs(options.limit || 50, options.level);
        socket.emit('logs:initial', logs);
    }

    handleMetricsSubscription(socket, options) {
        // Implementation for real-time metrics streaming
        const healthMonitor = this.debugCore.getMonitor('health');
        if (healthMonitor) {
            const metrics = healthMonitor.getMetrics(null, options.limit || 50);
            socket.emit('metrics:initial', metrics);
        }
    }

    getContentType(format) {
        const types = {
            json: 'application/json',
            csv: 'text/csv',
            text: 'text/plain'
        };
        return types[format] || 'text/plain';
    }

    generateDashboardHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FlashFusion Debug Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .status-healthy { color: #27ae60; }
        .status-warning { color: #f39c12; }
        .status-critical { color: #e74c3c; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .log-entry { padding: 8px; border-left: 4px solid #3498db; margin: 5px 0; background: #f8f9fa; }
        .log-error { border-left-color: #e74c3c; }
        .log-warn { border-left-color: #f39c12; }
        .log-debug { border-left-color: #9b59b6; }
        button { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #2980b9; }
        #status { font-weight: bold; }
        .loading { text-align: center; padding: 20px; }
    </style>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 FlashFusion Debug Dashboard</h1>
            <p>Real-time system monitoring and debugging</p>
            <div>Status: <span id="status" class="status-healthy">Connected</span></div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>System Health</h3>
                <div id="system-health" class="loading">Loading...</div>
            </div>

            <div class="card">
                <h3>Memory Usage</h3>
                <div id="memory-usage" class="loading">Loading...</div>
            </div>

            <div class="card">
                <h3>Active Alerts</h3>
                <div id="alerts" class="loading">Loading...</div>
            </div>

            <div class="card">
                <h3>Recent Logs</h3>
                <div id="logs" class="loading">Loading...</div>
                <button onclick="clearLogs()">Clear Logs</button>
            </div>
        </div>

        <div class="card">
            <h3>Performance Metrics</h3>
            <div id="metrics" class="loading">Loading...</div>
        </div>
    </div>

    <script>
        const socket = io();
        let isConnected = false;

        // Connection handling
        socket.on('connect', () => {
            isConnected = true;
            document.getElementById('status').textContent = 'Connected';
            document.getElementById('status').className = 'status-healthy';
            loadInitialData();
        });

        socket.on('disconnect', () => {
            isConnected = false;
            document.getElementById('status').textContent = 'Disconnected';
            document.getElementById('status').className = 'status-critical';
        });

        // Real-time updates
        socket.on('system:update', (data) => {
            updateSystemHealth(data.system);
            updateMemoryUsage(data.memory);
        });

        socket.on('log:new', (log) => {
            addLogEntry(log);
        });

        socket.on('alert:new', (alert) => {
            addAlert(alert);
        });

        // Initial data loading
        function loadInitialData() {
            fetch('/api/health').then(r => r.json()).then(updateSystemHealth);
            fetch('/api/logs?limit=20').then(r => r.json()).then(data => updateLogs(data.logs));
            fetch('/api/alerts').then(r => r.json()).then(data => updateAlerts(data.alerts));
            fetch('/api/metrics').then(r => r.json()).then(updateMetrics);
        }

        // Update functions
        function updateSystemHealth(health) {
            const div = document.getElementById('system-health');
            div.innerHTML = \`
                <div class="metric"><span>Status:</span><span class="status-\${health.status}">\${health.status.toUpperCase()}</span></div>
                <div class="metric"><span>Uptime:</span><span>\${formatUptime(health.uptime)}</span></div>
                <div class="metric"><span>Requests:</span><span>\${health.performance?.requestCount || 0}</span></div>
                <div class="metric"><span>Errors:</span><span>\${health.performance?.errorCount || 0}</span></div>
            \`;
        }

        function updateMemoryUsage(memory) {
            const div = document.getElementById('memory-usage');
            div.innerHTML = \`
                <div class="metric"><span>Heap Used:</span><span>\${(memory.heapUsed / 1024 / 1024).toFixed(1)} MB</span></div>
                <div class="metric"><span>Heap Total:</span><span>\${(memory.heapTotal / 1024 / 1024).toFixed(1)} MB</span></div>
                <div class="metric"><span>RSS:</span><span>\${(memory.rss / 1024 / 1024).toFixed(1)} MB</span></div>
                <div class="metric"><span>External:</span><span>\${(memory.external / 1024 / 1024).toFixed(1)} MB</span></div>
            \`;
        }

        function updateLogs(logs) {
            const div = document.getElementById('logs');
            div.innerHTML = logs.map(log => \`
                <div class="log-entry log-\${log.level}">
                    <strong>[\${log.level.toUpperCase()}] \${log.component || 'SYSTEM'}</strong>: \${log.message}
                    <small style="display: block; color: #666; margin-top: 4px;">\${new Date(log.timestamp).toLocaleTimeString()}</small>
                </div>
            \`).join('') + '<button onclick="clearLogs()">Clear Logs</button>';
        }

        function updateAlerts(alerts) {
            const div = document.getElementById('alerts');
            if (alerts.length === 0) {
                div.innerHTML = '<p style="color: #27ae60;">No active alerts</p>';
            } else {
                div.innerHTML = alerts.map(alert => \`
                    <div class="log-entry" style="border-left-color: \${alert.severity === 'critical' ? '#e74c3c' : '#f39c12'}">
                        <strong>\${alert.type.replace(/_/g, ' ').toUpperCase()}</strong>
                        <p>\${alert.data.message}</p>
                        <small>\${new Date(alert.timestamp).toLocaleString()}</small>
                    </div>
                \`).join('');
            }
        }

        function updateMetrics(data) {
            const div = document.getElementById('metrics');
            if (data.metrics && Object.keys(data.metrics).length > 0) {
                div.innerHTML = Object.entries(data.metrics).map(([type, metrics]) => \`
                    <h4>\${type.toUpperCase()}</h4>
                    <p>Latest metrics: \${metrics.length} data points</p>
                \`).join('');
            } else {
                div.innerHTML = '<p>No metrics available</p>';
            }
        }

        function addLogEntry(log) {
            const div = document.getElementById('logs');
            const newEntry = document.createElement('div');
            newEntry.className = \`log-entry log-\${log.level}\`;
            newEntry.innerHTML = \`
                <strong>[\${log.level.toUpperCase()}] \${log.component || 'SYSTEM'}</strong>: \${log.message}
                <small style="display: block; color: #666; margin-top: 4px;">\${new Date(log.timestamp).toLocaleTimeString()}</small>
            \`;
            div.insertBefore(newEntry, div.firstChild);
            
            // Keep only last 20 entries
            const entries = div.querySelectorAll('.log-entry');
            if (entries.length > 20) {
                entries[entries.length - 1].remove();
            }
        }

        function addAlert(alert) {
            // Refresh alerts
            fetch('/api/alerts').then(r => r.json()).then(data => updateAlerts(data.alerts));
        }

        function clearLogs() {
            fetch('/api/logs/clear', { method: 'POST' })
                .then(r => r.json())
                .then(() => {
                    document.getElementById('logs').innerHTML = '<p>Logs cleared</p><button onclick="clearLogs()">Clear Logs</button>';
                });
        }

        function formatUptime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            return \`\${hours}h \${minutes}m \${secs}s\`;
        }

        // Auto-refresh data every 30 seconds
        setInterval(() => {
            if (isConnected) {
                loadInitialData();
            }
        }, 30000);
    </script>
</body>
</html>
        `;
    }

    // Server Management
    async start() {
        if (this.state.isRunning) {
            throw new Error('Debug dashboard is already running');
        }

        return new Promise((resolve, reject) => {
            this.server.listen(this.config.port, this.config.host, (error) => {
                if (error) {
                    this.debugCore.error('DEBUG_DASHBOARD', 'Failed to start dashboard', error);
                    reject(error);
                } else {
                    this.state.isRunning = true;
                    this.state.startTime = Date.now();
                    
                    this.debugCore.info('DEBUG_DASHBOARD', 'Dashboard started', {
                        url: `http://${this.config.host}:${this.config.port}`,
                        websocket: this.config.enableWebSocket,
                        auth: this.config.enableAuth
                    });
                    
                    resolve({
                        url: `http://${this.config.host}:${this.config.port}`,
                        port: this.config.port,
                        host: this.config.host
                    });
                }
            });
        });
    }

    async stop() {
        if (!this.state.isRunning) return;

        return new Promise((resolve) => {
            this.server.close(() => {
                this.state.isRunning = false;
                this.state.startTime = null;
                this.state.connectedClients.clear();
                
                this.debugCore.info('DEBUG_DASHBOARD', 'Dashboard stopped');
                resolve();
            });
        });
    }

    isRunning() {
        return this.state.isRunning;
    }

    getUrl() {
        return this.state.isRunning ? `http://${this.config.host}:${this.config.port}` : null;
    }
}

module.exports = DebugDashboard;