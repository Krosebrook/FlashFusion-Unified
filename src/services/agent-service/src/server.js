const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const prometheus = require('prom-client');
require('dotenv').config();

const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { metricsMiddleware } = require('./middleware/metrics');
const { authMiddleware } = require('./middleware/auth');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const healthRoutes = require('./api/health');
const agentRoutes = require('./api/agents');
const conversationRoutes = require('./api/conversations');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Prometheus metrics setup
const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const activeAgents = new prometheus.Gauge({
  name: 'active_agents_total',
  help: 'Number of active AI agents'
});

const conversationCount = new prometheus.Counter({
  name: 'conversations_total',
  help: 'Total number of conversations processed'
});

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Metrics middleware
app.use(metricsMiddleware(httpRequestDuration));

// Rate limiting
app.use(rateLimitMiddleware);

// API Documentation
if (NODE_ENV !== 'production') {
  try {
    const swaggerDocument = YAML.load('./docs/api.yaml');
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (error) {
    logger.warn('Could not load API documentation:', error.message);
  }
}

// Health check (no auth required)
app.use('/health', healthRoutes);

// Metrics endpoint (no auth required)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', prometheus.register.contentType);
    const metrics = await prometheus.register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Error generating metrics:', error);
    res.status(500).send('Error generating metrics');
  }
});

// Authentication middleware for protected routes
app.use('/api', authMiddleware);

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/conversations', conversationRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  const server = app.listen(PORT);
  
  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Close database connections
      await require('./config/database').closeConnection();
      logger.info('Database connections closed');
      
      // Close Redis connections
      await require('./config/redis').closeConnection();
      logger.info('Redis connections closed');
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Start server
async function startServer() {
  try {
    // Initialize database connection
    await connectDatabase();
    logger.info('Database connected successfully');
    
    // Initialize Redis connection
    await connectRedis();
    logger.info('Redis connected successfully');
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Agent Service running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
      if (NODE_ENV !== 'production') {
        logger.info(`API documentation available at http://localhost:${PORT}/api/docs`);
      }
      logger.info(`Metrics available at http://localhost:${PORT}/metrics`);
    });
    
    // Set server timeout
    server.timeout = 30000;
    
    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Export metrics for testing
module.exports = {
  app,
  startServer,
  metrics: {
    httpRequestDuration,
    activeAgents,
    conversationCount
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}