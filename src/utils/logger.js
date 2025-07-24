/**
 * FlashFusion Unified Logger
 * Centralized logging system for the entire platform
 * CRITICAL: Vercel-safe implementation that never tries to write files in production
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const winston = require('winston');

// Safe fallback path for local dev
const localLogDir = path.join(__dirname, '../../logs');
const vercelLogDir = path.join(os.tmpdir(), 'logs');

// Create the log directory if not in Vercel
const isVercel = !!process.env.VERCEL;
const logDir = isVercel ? vercelLogDir : localLogDir;

if (!isVercel && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const transports = [];

if (isVercel) {
  // Use console logging only in Vercel
  transports.push(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta)}`;
        }
        return log;
      })
    )
  }));
} else {
  // Local development with file logging
  transports.push(
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let log = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          return log;
        })
      )
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isVercel ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'FlashFusion-Unified',
    version: process.env.APP_VERSION || '2.0.0',
    environment: isVercel ? 'production' : 'development'
  },
  transports,
});

// Helper functions for structured logging
const createContextualLogger = (context) => {
    return {
        debug: (message, meta = {}) => logger.debug(message, { context, ...meta }),
        info: (message, meta = {}) => logger.info(message, { context, ...meta }),
        warn: (message, meta = {}) => logger.warn(message, { context, ...meta }),
        error: (message, meta = {}) => logger.error(message, { context, ...meta })
    };
};

// Workflow-specific logging
const workflowLogger = (workflowId, workflowType) => {
    const context = { workflowId, workflowType, component: 'workflow' };
    return createContextualLogger(context);
};

// Agent-specific logging
const agentLogger = (agentId, workflowId = null) => {
    const context = { agentId, workflowId, component: 'agent' };
    return createContextualLogger(context);
};

// API request logging
const apiLogger = (method, path, userId = null) => {
    const context = { method, path, userId, component: 'api' };
    return createContextualLogger(context);
};

// Performance logging
const performanceLogger = (operation, duration, metadata = {}) => {
    logger.info(`Performance: ${operation} completed`, {
        component: 'performance',
        operation,
        duration,
        ...metadata
    });
};

// Error logging with context
const logError = (error, context = {}) => {
    logger.error('Error occurred', {
        message: error.message,
        stack: error.stack,
        ...context
    });
};

// Business metrics logging
const businessLogger = {
    userAction: (userId, action, metadata = {}) => {
        logger.info(`User action: ${action}`, {
            component: 'business',
            userId,
            action,
            ...metadata
        });
    },
    
    workflowCompleted: (workflowId, workflowType, duration, success = true) => {
        logger.info(`Workflow completed: ${workflowType}`, {
            component: 'business',
            workflowId,
            workflowType,
            duration,
            success
        });
    },
    
    revenueEvent: (userId, amount, type, metadata = {}) => {
        logger.info(`Revenue event: ${type}`, {
            component: 'business',
            userId,
            amount,
            type,
            ...metadata
        });
    }
};

// System health logging
const healthLogger = {
    serviceUp: (serviceName) => {
        logger.info(`Service started: ${serviceName}`, {
            component: 'health',
            service: serviceName,
            status: 'up'
        });
    },
    
    serviceDown: (serviceName, error = null) => {
        logger.error(`Service failed: ${serviceName}`, {
            component: 'health',
            service: serviceName,
            status: 'down',
            error: error?.message
        });
    },
    
    healthCheck: (services) => {
        logger.info('Health check completed', {
            component: 'health',
            services
        });
    }
};

// Export main logger and helper functions
module.exports = {
    // Main logger instance
    ...logger,
    
    // Contextual loggers
    createContextualLogger,
    workflowLogger,
    agentLogger,
    apiLogger,
    
    // Specialized logging functions
    performanceLogger,
    logError,
    businessLogger,
    healthLogger,
    
    // Utility functions
    setLogLevel: (level) => {
        logger.level = level;
    },
    
    getLogLevel: () => logger.level
};