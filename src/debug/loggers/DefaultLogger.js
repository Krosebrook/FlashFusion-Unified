/**
 * Default Logger for FlashFusion Debug System
 * Consolidates existing logging infrastructure with new debug capabilities
 */

const universalLogger = require('../../utils/universalLogger');

class DefaultLogger {
    constructor(debugCore, options = {}) {
        this.debugCore = debugCore;
        this.config = {
            enableConsole: options.enableConsole !== false,
            enableHistory: options.enableHistory !== false,
            colorize: options.colorize !== false,
            includeTimestamp: options.includeTimestamp !== false,
            includeComponent: options.includeComponent !== false,
            includeMemory: options.includeMemory === true,
            includePerformance: options.includePerformance === true,
            ...options
        };

        this.colors = {
            error: '\x1b[31m',   // Red
            warn: '\x1b[33m',    // Yellow
            info: '\x1b[36m',    // Cyan
            debug: '\x1b[35m',   // Magenta
            trace: '\x1b[37m',   // White
            reset: '\x1b[0m'     // Reset
        };

        this.logHistory = [];
        this.maxHistory = options.maxHistory || 1000;
    }

    log(logEntry) {
        try {
            // Format the log message
            const formattedMessage = this.formatMessage(logEntry);
            
            // Log to console if enabled
            if (this.config.enableConsole) {
                this.logToConsole(logEntry, formattedMessage);
            }

            // Add to history if enabled
            if (this.config.enableHistory) {
                this.addToHistory(logEntry);
            }

            // Log to universal logger for compatibility
            this.logToUniversalLogger(logEntry);

            return true;
        } catch (error) {
            // Fallback to console.error if logger fails
            console.error('DefaultLogger failed:', error.message, logEntry);
            return false;
        }
    }

    formatMessage(logEntry) {
        const parts = [];

        // Timestamp
        if (this.config.includeTimestamp) {
            parts.push(`[${new Date(logEntry.timestamp).toLocaleTimeString()}]`);
        }

        // Level
        parts.push(`[${logEntry.level.toUpperCase()}]`);

        // Component
        if (this.config.includeComponent && logEntry.component) {
            parts.push(`[${logEntry.component}]`);
        }

        // Process ID
        if (logEntry.pid) {
            parts.push(`[PID:${logEntry.pid}]`);
        }

        // Message
        parts.push(logEntry.message);

        // Data
        if (logEntry.data) {
            if (typeof logEntry.data === 'object') {
                parts.push(JSON.stringify(logEntry.data, null, 2));
            } else {
                parts.push(String(logEntry.data));
            }
        }

        // Memory info
        if (this.config.includeMemory && logEntry.memory) {
            const memMB = (logEntry.memory.heapUsed / 1024 / 1024).toFixed(1);
            parts.push(`[MEM:${memMB}MB]`);
        }

        // Performance info
        if (this.config.includePerformance && logEntry.performance) {
            if (logEntry.performance.uptime) {
                const uptimeMin = (logEntry.performance.uptime / 1000 / 60).toFixed(1);
                parts.push(`[UP:${uptimeMin}m]`);
            }
        }

        return parts.join(' ');
    }

    logToConsole(logEntry, formattedMessage) {
        const level = logEntry.level;
        const color = this.colors[level] || this.colors.reset;
        const resetColor = this.colors.reset;

        if (this.config.colorize && process.stdout.isTTY) {
            console.log(`${color}${formattedMessage}${resetColor}`);
        } else {
            console.log(formattedMessage);
        }
    }

    logToUniversalLogger(logEntry) {
        // Maintain compatibility with existing universal logger
        const method = universalLogger[logEntry.level] || universalLogger.info;
        method.call(universalLogger, logEntry.message, logEntry.data);
    }

    addToHistory(logEntry) {
        this.logHistory.push({
            ...logEntry,
            formattedMessage: this.formatMessage(logEntry)
        });

        // Maintain history size limit
        if (this.logHistory.length > this.maxHistory) {
            this.logHistory.shift();
        }
    }

    // Query methods for debugging
    getRecentLogs(count = 50, level = null) {
        let logs = this.logHistory.slice(-count);
        
        if (level) {
            logs = logs.filter(log => log.level === level);
        }

        return logs;
    }

    searchLogs(query, options = {}) {
        const {
            level = null,
            component = null,
            startTime = null,
            endTime = null,
            limit = 100
        } = options;

        let results = this.logHistory;

        // Filter by level
        if (level) {
            results = results.filter(log => log.level === level);
        }

        // Filter by component
        if (component) {
            results = results.filter(log => log.component === component);
        }

        // Filter by time range
        if (startTime) {
            results = results.filter(log => new Date(log.timestamp) >= new Date(startTime));
        }
        if (endTime) {
            results = results.filter(log => new Date(log.timestamp) <= new Date(endTime));
        }

        // Search in message and data
        if (query) {
            const searchQuery = query.toLowerCase();
            results = results.filter(log => {
                const message = log.message.toLowerCase();
                const data = log.data ? JSON.stringify(log.data).toLowerCase() : '';
                return message.includes(searchQuery) || data.includes(searchQuery);
            });
        }

        // Limit results
        return results.slice(-limit);
    }

    getLogStats() {
        const stats = {
            total: this.logHistory.length,
            byLevel: {},
            byComponent: {},
            timeRange: null
        };

        // Count by level
        for (const log of this.logHistory) {
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
        }

        // Count by component
        for (const log of this.logHistory) {
            if (log.component) {
                stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1;
            }
        }

        // Time range
        if (this.logHistory.length > 0) {
            const first = this.logHistory[0];
            const last = this.logHistory[this.logHistory.length - 1];
            stats.timeRange = {
                start: first.timestamp,
                end: last.timestamp,
                duration: new Date(last.timestamp) - new Date(first.timestamp)
            };
        }

        return stats;
    }

    // Export logs for analysis
    exportLogs(format = 'json', options = {}) {
        const logs = this.getRecentLogs(options.limit || this.logHistory.length, options.level);

        switch (format) {
            case 'json':
                return JSON.stringify(logs, null, 2);
            
            case 'csv':
                return this.exportToCSV(logs);
            
            case 'text':
                return logs.map(log => log.formattedMessage || this.formatMessage(log)).join('\n');
            
            default:
                return logs;
        }
    }

    exportToCSV(logs) {
        if (logs.length === 0) return '';

        const headers = ['timestamp', 'level', 'component', 'message', 'data', 'pid'];
        const csvRows = [headers.join(',')];

        for (const log of logs) {
            const row = [
                log.timestamp,
                log.level,
                log.component || '',
                `"${log.message.replace(/"/g, '""')}"`,
                log.data ? `"${JSON.stringify(log.data).replace(/"/g, '""')}"` : '',
                log.pid || ''
            ];
            csvRows.push(row.join(','));
        }

        return csvRows.join('\n');
    }

    // Clear history
    clearHistory() {
        this.logHistory = [];
        this.debugCore.info('DEFAULT_LOGGER', 'Log history cleared');
    }

    // Configuration updates
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.debugCore.info('DEFAULT_LOGGER', 'Configuration updated', newConfig);
    }
}

module.exports = DefaultLogger;