import client from 'prom-client';

// Enable default metrics (process, GC, etc.)
client.collectDefaultMetrics({
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Create custom metrics
export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'user_agent'],
});

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
});

export const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

export const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
});

export const redisOperationDuration = new client.Histogram({
  name: 'redis_operation_duration_seconds',
  help: 'Duration of Redis operations in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

export const businessMetrics = new client.Counter({
  name: 'business_events_total',
  help: 'Total number of business events',
  labelNames: ['event_type', 'user_type'],
});

// Express middleware to collect HTTP metrics
export function prometheusMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Track active connections
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const route = req.route?.path || req.path;
    const userAgent = req.get('User-Agent') || 'unknown';
    
    httpRequestCounter
      .labels(req.method, route, res.statusCode.toString(), userAgent)
      .inc();
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    activeConnections.dec();
  });

  next();
}

// Database query wrapper for metrics
export function wrapDatabaseQuery(originalQuery) {
  return async function(query, params) {
    const startTime = Date.now();
    const queryType = query.trim().split(' ')[0].toLowerCase();
    
    try {
      const result = await originalQuery.call(this, query, params);
      const duration = (Date.now() - startTime) / 1000;
      
      databaseQueryDuration
        .labels(queryType, 'unknown')
        .observe(duration);
      
      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      
      databaseQueryDuration
        .labels(queryType, 'error')
        .observe(duration);
      
      throw error;
    }
  };
}

// Redis operation wrapper for metrics
export function wrapRedisOperation(operation, operationName) {
  return async function(...args) {
    const startTime = Date.now();
    
    try {
      const result = await operation.apply(this, args);
      const duration = (Date.now() - startTime) / 1000;
      
      redisOperationDuration
        .labels(operationName)
        .observe(duration);
      
      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      
      redisOperationDuration
        .labels(`${operationName}_error`)
        .observe(duration);
      
      throw error;
    }
  };
}

// Business metrics helper
export function trackBusinessEvent(eventType, userType = 'anonymous') {
  businessMetrics.labels(eventType, userType).inc();
}

// Metrics endpoint setup
export function registerMetricsEndpoint(app) {
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', client.register.contentType);
      const metrics = await client.register.metrics();
      res.send(metrics);
    } catch (error) {
      console.error('Error generating metrics:', error);
      res.status(500).send('Error generating metrics');
    }
  });
}

// Clear metrics (useful for testing)
export function clearMetrics() {
  client.register.clear();
}