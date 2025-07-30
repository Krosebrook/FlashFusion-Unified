# FlashFusion Debug & Explore System

A comprehensive debugging and exploration system for the FlashFusion platform that provides real-time monitoring, logging, performance tracking, and codebase analysis capabilities.

## 🚀 Features

### Debug System
- **Centralized Logging**: Unified logging system with multiple output formats
- **Performance Monitoring**: Real-time performance metrics and timing
- **Memory Tracking**: Memory usage monitoring with alerts
- **Request Tracking**: HTTP request/response monitoring
- **System Health**: Comprehensive health checks and alerts
- **Web Dashboard**: Real-time web-based monitoring interface

### Explore System
- **Codebase Analysis**: Complete project structure analysis
- **Dependency Tracking**: Unused and missing dependency detection
- **File Search**: Fast file and content search capabilities
- **Metrics Collection**: Code quality and complexity metrics
- **Architecture Detection**: Automatic pattern recognition

## 📁 Directory Structure

```
src/
├── debug/
│   ├── core/
│   │   └── DebugCore.js           # Central debug orchestrator
│   ├── loggers/
│   │   └── DefaultLogger.js       # Enhanced logging with search/export
│   ├── monitors/
│   │   └── SystemHealthMonitor.js # System health and alerts
│   ├── dashboards/
│   │   └── DebugDashboard.js      # Web-based debug interface
│   ├── tools/                     # Debug utilities
│   ├── analyzers/                 # Log and data analyzers
│   ├── index.js                   # Main debug system entry point
│   └── README.md                  # This file
└── explore/
    ├── codebase/
    │   └── CodebaseAnalyzer.js    # Project analysis tools
    ├── system/                    # System introspection
    ├── performance/               # Performance analysis
    ├── dependencies/              # Dependency analysis
    └── api/                       # API exploration tools
```

## 🔧 Quick Start

### Basic Usage

```javascript
const { initializeDebugSystem } = require('./src/debug');

// Initialize with default settings
const debugSystem = await initializeDebugSystem({
    logLevel: 'debug',
    dashboardPort: 3001,
    enableHealthMonitoring: true,
    enableCodebaseAnalysis: true,
    enableDashboard: true
});

// Access the dashboard at http://localhost:3001
console.log('Dashboard URL:', debugSystem.getDashboardUrl());
```

### Express.js Integration

```javascript
const express = require('express');
const { getDebugSystem } = require('./src/debug');

const app = express();
const debugSystem = getDebugSystem();

// Add debug middleware for request tracking
app.use(debugSystem.middleware());

// Your routes here
app.get('/', (req, res) => {
    debugSystem.info('ROUTE', 'Home page accessed');
    res.send('Hello World');
});

app.listen(3000, async () => {
    await debugSystem.start();
    console.log('Server running with debug system active');
    console.log('Debug Dashboard:', debugSystem.getDashboardUrl());
});
```

### Manual Logging

```javascript
const { getDebugSystem } = require('./src/debug');
const debug = getDebugSystem();

// Different log levels
debug.error('DATABASE', 'Connection failed', { host: 'localhost', port: 5432 });
debug.warn('AUTH', 'Rate limit approaching', { remaining: 5 });
debug.info('USER', 'New user registered', { userId: '12345' });
debug.debug('CACHE', 'Cache miss', { key: 'user:profile:123' });

// Performance timing
const timerId = debug.startTimer('database_query', { table: 'users' });
// ... perform database operation
debug.endTimer(timerId, { rowsReturned: 42 });
```

## 🖥️ Debug Dashboard

The web dashboard provides real-time monitoring with the following features:

### System Health
- Overall system status
- Memory usage tracking
- CPU utilization
- Event loop lag monitoring
- Active alerts and warnings

### Logs Management
- Real-time log streaming
- Log level filtering
- Component-based filtering
- Full-text search
- Export capabilities (JSON, CSV, Text)

### Performance Metrics
- Request/response times
- Memory snapshots
- Performance timers
- System resource usage

### Codebase Insights
- Project structure analysis
- Dependency health
- Code metrics
- File search

### API Endpoints

The dashboard exposes several API endpoints:

- `GET /api/health` - System health check
- `GET /api/logs` - Retrieve logs with filtering
- `GET /api/metrics` - Performance metrics
- `GET /api/alerts` - Active system alerts
- `GET /api/codebase` - Codebase analysis data
- `POST /api/logs/clear` - Clear log history
- `GET /api/export/logs` - Export logs in various formats

## 📊 System Health Monitoring

The health monitor tracks various system metrics:

### Memory Monitoring
- Heap usage tracking
- Memory leak detection
- Automatic garbage collection alerts
- System memory utilization

### Performance Monitoring
- Event loop lag detection
- CPU usage tracking
- Request throughput
- Response time analysis

### Alert System
- Configurable thresholds
- Multiple severity levels (info, warning, critical)
- Alert acknowledgment and resolution
- Real-time notifications

### Configuration

```javascript
const debugSystem = await initializeDebugSystem({
    healthMonitor: {
        checkInterval: 10000,        // 10 seconds
        memoryThreshold: 500,        // 500MB
        cpuThreshold: 80,           // 80%
        eventLoopLagThreshold: 100, // 100ms
        enableCpuMonitoring: true,
        enableMemoryMonitoring: true,
        enableDiskMonitoring: false,
        enableNetworkMonitoring: false
    }
});
```

## 🔍 Codebase Analysis

The codebase analyzer provides comprehensive project insights:

### File Structure Analysis
- Complete project tree
- File categorization (code, config, docs, assets)
- Size and complexity metrics
- Naming pattern analysis

### Dependency Analysis
- Unused dependency detection
- Missing dependency identification
- Security vulnerability scanning
- Version outdated detection

### Code Metrics
- Lines of code counting
- Function and class counting
- Import/export analysis
- Complexity indicators

### Usage Example

```javascript
const debugSystem = getDebugSystem();

// Perform full codebase analysis
const analysis = await debugSystem.analyzeCodebase({
    enableMetrics: true,
    enableDependencyAnalysis: true
});

console.log('Project metrics:', analysis.metrics);
console.log('Dependencies:', analysis.dependencies);

// Search for specific files
const searchResults = await debugSystem.searchFiles('config', {
    limit: 10
});

console.log('Config files found:', searchResults);
```

## ⚙️ Configuration Options

### Debug Core Configuration

```javascript
{
    level: 'info',                    // Log level (error, warn, info, debug, trace)
    enablePerformanceTracking: true,  // Enable performance timers
    enableMemoryTracking: true,       // Enable memory monitoring
    enableRequestTracking: true,      // Enable HTTP request tracking
    maxLogHistory: 10000,            // Maximum logs to keep in memory
    flushInterval: 30000             // Cleanup interval in milliseconds
}
```

### Logger Configuration

```javascript
{
    enableConsole: true,        // Log to console
    enableHistory: true,        // Keep log history
    colorize: true,            // Colorize console output
    includeTimestamp: true,    // Include timestamps
    includeComponent: true,    // Include component names
    includeMemory: false,      // Include memory info in logs
    includePerformance: false, // Include performance info
    maxHistory: 1000          // Maximum history entries
}
```

### Dashboard Configuration

```javascript
{
    port: 3001,               // Dashboard port
    host: 'localhost',        // Dashboard host
    enableAuth: false,        // Enable authentication
    authToken: null,          // Auth token (if auth enabled)
    enableWebSocket: true,    // Enable real-time updates
    updateInterval: 1000,     // Update interval in milliseconds
    maxClients: 10           // Maximum concurrent clients
}
```

## 🔧 Advanced Usage

### Custom Loggers

You can create custom loggers by extending the base logger:

```javascript
const { DefaultLogger } = require('./src/debug');

class CustomLogger extends DefaultLogger {
    log(logEntry) {
        // Custom logging logic
        super.log(logEntry);
        
        // Send to external service
        this.sendToExternalService(logEntry);
    }
    
    sendToExternalService(logEntry) {
        // Implementation for external logging service
    }
}

// Register custom logger
debugSystem.debugCore.registerLogger('custom', new CustomLogger(debugSystem.debugCore));
```

### Custom Monitors

Create custom system monitors:

```javascript
const { EventEmitter } = require('events');

class CustomMonitor extends EventEmitter {
    constructor(debugCore, options = {}) {
        super();
        this.debugCore = debugCore;
        this.isRunning = false;
    }
    
    start() {
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.performCheck();
        }, 5000);
    }
    
    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
    
    performCheck() {
        // Custom monitoring logic
        const metric = this.collectMetric();
        this.emit('metric:collected', metric);
    }
}

// Register custom monitor
debugSystem.debugCore.registerMonitor('custom', new CustomMonitor(debugSystem.debugCore));
```

### Event Handling

Listen to debug system events:

```javascript
const debugSystem = getDebugSystem();

// Listen to log events
debugSystem.on('log', (logEntry) => {
    if (logEntry.level === 'error') {
        // Handle error logs
        notifyAdministrator(logEntry);
    }
});

// Listen to performance events
debugSystem.on('timer:end', (timerResult) => {
    if (timerResult.duration > 1000) {
        // Handle slow operations
        debugSystem.warn('PERFORMANCE', 'Slow operation detected', timerResult);
    }
});

// Listen to health events
debugSystem.on('alert:created', (alert) => {
    // Handle system alerts
    console.log('System alert:', alert.data.message);
});
```

## 🚀 Production Considerations

### Performance Impact
- The debug system is designed to have minimal performance impact
- Monitoring can be selectively disabled in production
- Log levels can be adjusted to reduce verbosity
- Dashboard can be disabled in production environments

### Security
- Dashboard should be secured in production environments
- Consider enabling authentication for the dashboard
- Restrict dashboard access to internal networks only
- Be cautious about logging sensitive information

### Memory Management
- Log history is automatically managed with configurable limits
- Metrics are cleaned up automatically to prevent memory leaks
- Consider reducing history limits in memory-constrained environments

### Example Production Configuration

```javascript
const debugSystem = await initializeDebugSystem({
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enableDashboard: process.env.NODE_ENV !== 'production',
    enableCodebaseAnalysis: false, // Disable in production
    healthMonitor: {
        checkInterval: 30000, // Less frequent checks
        memoryThreshold: 1000 // Higher threshold
    },
    logger: {
        maxHistory: 500, // Reduced history
        includeMemory: false,
        includePerformance: false
    }
});
```

## 🤝 Contributing

When contributing to the debug system:

1. Follow the existing code patterns
2. Add comprehensive error handling
3. Include JSDoc comments
4. Add tests for new functionality
5. Update this documentation

## 📝 License

This debug system is part of the FlashFusion platform and follows the same license terms.