/**
 * FlashFusion Unified Logger
 * Centralized logging system for the entire platform
 */

const winston = require('winston');
const path = require('path');

// Custom log format for FlashFusion
const flashFusionFormat = winston.format.combine(winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss'
}), winston.format.errors({
  stack: true
}), winston.format.colorize({
  all: true
}), winston.format.printf(({
  timestamp,
  level,
  message,
  stack,
  ...meta
}) => {
  let log = `${timestamp} [${level}]: ${message}`;

  // Add metadata if present
  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta, null, 2)}`;
  }

  // Add stack trace for errors
  if (stack) {
    log += `\n${stack}`;
  }
  return log;
}));

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: flashFusionFormat,
  defaultMeta: {
    service: 'FlashFusion-Unified',
    version: process.env.APP_VERSION || '2.0.0'
  },
  transports: [
  // Console output
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), flashFusionFormat)
  })]
});

// Add file transports in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true') {
  // Error log file
  logger.add(new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    maxsize: 5242880,
    // 5MB
    maxFiles: 5
  }));

  // Combined log file
  logger.add(new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    maxsize: 5242880,
    // 5MB
    maxFiles: 10
  }));
}

// Helper functions for structured logging
const createContextualLogger = context => {
  return {
    debug: (message, meta = {}) => logger.debug(message, {
      context,
      ...meta
    }),
    info: (message, meta = {}) => logger.info(message, {
      context,
      ...meta
    }),
    warn: (message, meta = {}) => logger.warn(message, {
      context,
      ...meta
    }),
    error: (message, meta = {}) => logger.error(message, {
      context,
      ...meta
    })
  };
};

// Workflow-specific logging
const workflowLogger = (workflowId, workflowType) => {
  const context = {
    workflowId,
    workflowType,
    component: 'workflow'
  };
  return createContextualLogger(context);
};

// Agent-specific logging
const agentLogger = (agentId, workflowId = null) => {
  const context = {
    agentId,
    workflowId,
    component: 'agent'
  };
  return createContextualLogger(context);
};

// API request logging
const apiLogger = (method, path, userId = null) => {
  const context = {
    method,
    path,
    userId,
    component: 'api'
  };
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
  serviceUp: serviceName => {
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
  healthCheck: services => {
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
  setLogLevel: level => {
    logger.level = level;
  },
  getLogLevel: () => logger.level
};