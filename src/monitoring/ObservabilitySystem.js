/**
 * FlashFusion Comprehensive Observability System
 * Provides monitoring, logging, alerting, and analytics capabilities
 */

import { EventEmitter } from 'events';
import winston from 'winston';

/**
 * Main Observability System
 */
export class ObservabilitySystem extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      enableMetrics: true,
      enableLogging: true,
      enableTracing: true,
      enableAlerting: true,
      retentionDays: 30,
      ...config
    };
    
    this.metrics = new MetricsCollector(this.config);
    this.logger = new AdvancedLogger(this.config);
    this.tracer = new DistributedTracer(this.config);
    this.alertManager = new AlertManager(this.config);
    this.healthChecker = new HealthChecker(this.config);
    this.performanceMonitor = new PerformanceMonitor(this.config);
    this.errorTracker = new ErrorTracker(this.config);
    this.userAnalytics = new UserAnalytics(this.config);
    
    this.initialize();
  }
  
  async initialize() {
    await Promise.all([
      this.metrics.initialize(),
      this.logger.initialize(),
      this.tracer.initialize(),
      this.alertManager.initialize(),
      this.healthChecker.initialize(),
      this.performanceMonitor.initialize(),
      this.errorTracker.initialize(),
      this.userAnalytics.initialize()
    ]);
    
    this.setupEventHandlers();
    this.startPeriodicTasks();
    
    this.emit('initialized');
  }
  
  setupEventHandlers() {
    // Cross-system event handling
    this.metrics.on('threshold_exceeded', (data) => {
      this.alertManager.trigger('metric_threshold', data);
    });
    
    this.errorTracker.on('critical_error', (error) => {
      this.alertManager.trigger('critical_error', error);
    });
    
    this.healthChecker.on('service_down', (service) => {
      this.alertManager.trigger('service_down', service);
    });
  }
  
  startPeriodicTasks() {
    // Health checks every 30 seconds
    setInterval(() => {
      this.healthChecker.performHealthCheck();
    }, 30000);
    
    // Metrics aggregation every minute
    setInterval(() => {
      this.metrics.aggregateMetrics();
    }, 60000);
    
    // Performance analysis every 5 minutes
    setInterval(() => {
      this.performanceMonitor.analyzePerformance();
    }, 300000);
    
    // Cleanup old data daily
    setInterval(() => {
      this.cleanup();
    }, 24 * 60 * 60 * 1000);
  }
  
  // Main API methods
  recordMetric(name, value, labels = {}) {
    return this.metrics.record(name, value, labels);
  }
  
  logEvent(level, message, metadata = {}) {
    return this.logger.log(level, message, metadata);
  }
  
  startTrace(name, metadata = {}) {
    return this.tracer.startTrace(name, metadata);
  }
  
  recordError(error, context = {}) {
    return this.errorTracker.recordError(error, context);
  }
  
  trackUserEvent(userId, event, properties = {}) {
    return this.userAnalytics.trackEvent(userId, event, properties);
  }
  
  async getSystemHealth() {
    return await this.healthChecker.getOverallHealth();
  }
  
  async getMetricsSummary(timeRange = '1h') {
    return await this.metrics.getSummary(timeRange);
  }
  
  async getPerformanceReport(timeRange = '1h') {
    return await this.performanceMonitor.getReport(timeRange);
  }
  
  async cleanup() {
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    
    await Promise.all([
      this.metrics.cleanup(cutoffDate),
      this.logger.cleanup(cutoffDate),
      this.tracer.cleanup(cutoffDate),
      this.errorTracker.cleanup(cutoffDate),
      this.userAnalytics.cleanup(cutoffDate)
    ]);
  }
}

/**
 * Metrics Collection System
 */
class MetricsCollector extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.metrics = new Map();
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    this.timers = new Map();
  }
  
  async initialize() {
    // Initialize metrics storage
    this.setupDefaultMetrics();
  }
  
  setupDefaultMetrics() {
    // System metrics
    this.registerCounter('requests_total', 'Total number of requests');
    this.registerCounter('errors_total', 'Total number of errors');
    this.registerGauge('active_users', 'Number of active users');
    this.registerGauge('memory_usage', 'Memory usage in bytes');
    this.registerGauge('cpu_usage', 'CPU usage percentage');
    
    // Agent metrics
    this.registerCounter('agent_tasks_total', 'Total agent tasks executed');
    this.registerHistogram('agent_response_time', 'Agent response time distribution');
    this.registerGauge('agent_success_rate', 'Agent success rate');
    
    // Business metrics
    this.registerCounter('conversations_total', 'Total conversations');
    this.registerCounter('workflows_executed', 'Total workflows executed');
    this.registerGauge('revenue_total', 'Total revenue');
  }
  
  registerCounter(name, description) {
    this.counters.set(name, { value: 0, description, labels: new Map() });
  }
  
  registerGauge(name, description) {
    this.gauges.set(name, { value: 0, description, labels: new Map() });
  }
  
  registerHistogram(name, description, buckets = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]) {
    this.histograms.set(name, { 
      buckets: new Map(buckets.map(b => [b, 0])),
      count: 0,
      sum: 0,
      description,
      labels: new Map()
    });
  }
  
  record(name, value, labels = {}) {
    const timestamp = new Date();
    const labelKey = this.getLabelKey(labels);
    
    // Determine metric type and record
    if (this.counters.has(name)) {
      this.recordCounter(name, value, labelKey, timestamp);
    } else if (this.gauges.has(name)) {
      this.recordGauge(name, value, labelKey, timestamp);
    } else if (this.histograms.has(name)) {
      this.recordHistogram(name, value, labelKey, timestamp);
    } else {
      // Auto-create as counter
      this.registerCounter(name, `Auto-created metric: ${name}`);
      this.recordCounter(name, value, labelKey, timestamp);
    }
    
    // Check thresholds
    this.checkThresholds(name, value, labels);
    
    return { name, value, labels, timestamp };
  }
  
  recordCounter(name, value, labelKey, timestamp) {
    const counter = this.counters.get(name);
    if (!counter.labels.has(labelKey)) {
      counter.labels.set(labelKey, 0);
    }
    counter.labels.set(labelKey, counter.labels.get(labelKey) + value);
    counter.value += value;
  }
  
  recordGauge(name, value, labelKey, timestamp) {
    const gauge = this.gauges.get(name);
    gauge.labels.set(labelKey, value);
    gauge.value = value;
  }
  
  recordHistogram(name, value, labelKey, timestamp) {
    const histogram = this.histograms.get(name);
    
    // Update buckets
    for (const [bucket, count] of histogram.buckets) {
      if (value <= bucket) {
        histogram.buckets.set(bucket, count + 1);
      }
    }
    
    histogram.count++;
    histogram.sum += value;
  }
  
  getLabelKey(labels) {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
  }
  
  checkThresholds(name, value, labels) {
    const thresholds = {
      'agent_response_time': { max: 5000, min: 0 },
      'error_rate': { max: 0.05, min: 0 },
      'memory_usage': { max: 0.9, min: 0 },
      'cpu_usage': { max: 0.8, min: 0 }
    };
    
    const threshold = thresholds[name];
    if (threshold) {
      if (value > threshold.max || value < threshold.min) {
        this.emit('threshold_exceeded', {
          metric: name,
          value,
          threshold,
          labels,
          timestamp: new Date()
        });
      }
    }
  }
  
  async getSummary(timeRange = '1h') {
    const summary = {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: this.getHistogramSummary(),
      timeRange,
      timestamp: new Date()
    };
    
    return summary;
  }
  
  getHistogramSummary() {
    const summary = {};
    
    for (const [name, histogram] of this.histograms) {
      summary[name] = {
        count: histogram.count,
        sum: histogram.sum,
        average: histogram.count > 0 ? histogram.sum / histogram.count : 0,
        buckets: Object.fromEntries(histogram.buckets),
        description: histogram.description
      };
    }
    
    return summary;
  }
  
  async aggregateMetrics() {
    // Aggregate metrics for storage and analysis
    const aggregated = {
      timestamp: new Date(),
      counters: this.getCounterDeltas(),
      gauges: this.getCurrentGauges(),
      histograms: this.getHistogramStats()
    };
    
    // Store aggregated metrics (would typically go to a time-series database)
    this.emit('metrics_aggregated', aggregated);
    
    return aggregated;
  }
  
  getCounterDeltas() {
    // In a real implementation, you'd track deltas since last aggregation
    const deltas = {};
    for (const [name, counter] of this.counters) {
      deltas[name] = counter.value;
    }
    return deltas;
  }
  
  getCurrentGauges() {
    const current = {};
    for (const [name, gauge] of this.gauges) {
      current[name] = gauge.value;
    }
    return current;
  }
  
  getHistogramStats() {
    const stats = {};
    for (const [name, histogram] of this.histograms) {
      stats[name] = {
        count: histogram.count,
        sum: histogram.sum,
        avg: histogram.count > 0 ? histogram.sum / histogram.count : 0
      };
    }
    return stats;
  }
  
  async cleanup(cutoffDate) {
    // Clean up old metric data
    // Implementation would depend on storage backend
  }
}

/**
 * Advanced Logging System
 */
class AdvancedLogger {
  constructor(config) {
    this.config = config;
    this.logger = winston.createLogger({
      level: config.logLevel || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'flashfusion' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
    
    this.logBuffer = [];
    this.maxBufferSize = config.maxLogBuffer || 1000;
  }
  
  async initialize() {
    // Setup log rotation, external log shipping, etc.
  }
  
  log(level, message, metadata = {}) {
    const logEntry = {
      level,
      message,
      metadata: {
        ...metadata,
        timestamp: new Date(),
        traceId: metadata.traceId || this.generateTraceId()
      }
    };
    
    this.logger.log(level, message, logEntry.metadata);
    
    // Add to buffer for real-time analysis
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
    
    return logEntry;
  }
  
  info(message, metadata = {}) {
    return this.log('info', message, metadata);
  }
  
  warn(message, metadata = {}) {
    return this.log('warn', message, metadata);
  }
  
  error(message, metadata = {}) {
    return this.log('error', message, metadata);
  }
  
  debug(message, metadata = {}) {
    return this.log('debug', message, metadata);
  }
  
  generateTraceId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  getRecentLogs(count = 100, level = null) {
    let logs = this.logBuffer.slice(-count);
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    return logs;
  }
  
  async cleanup(cutoffDate) {
    // Clean up old log files
  }
}

/**
 * Distributed Tracing System
 */
class DistributedTracer {
  constructor(config) {
    this.config = config;
    this.activeTraces = new Map();
    this.completedTraces = [];
    this.maxTraces = config.maxTraces || 10000;
  }
  
  async initialize() {
    // Initialize tracing backend
  }
  
  startTrace(name, metadata = {}) {
    const traceId = this.generateTraceId();
    const trace = new TraceSpan(traceId, name, metadata);
    
    this.activeTraces.set(traceId, trace);
    
    return trace;
  }
  
  endTrace(traceId, metadata = {}) {
    const trace = this.activeTraces.get(traceId);
    if (trace) {
      trace.end(metadata);
      this.activeTraces.delete(traceId);
      this.completedTraces.push(trace);
      
      // Maintain trace history size
      if (this.completedTraces.length > this.maxTraces) {
        this.completedTraces = this.completedTraces.slice(-this.maxTraces);
      }
    }
    
    return trace;
  }
  
  generateTraceId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getTrace(traceId) {
    return this.activeTraces.get(traceId) || 
           this.completedTraces.find(t => t.traceId === traceId);
  }
  
  getActiveTraces() {
    return Array.from(this.activeTraces.values());
  }
  
  getSlowTraces(threshold = 5000) {
    return this.completedTraces.filter(trace => 
      trace.duration && trace.duration > threshold
    );
  }
  
  async cleanup(cutoffDate) {
    this.completedTraces = this.completedTraces.filter(
      trace => trace.endTime && trace.endTime > cutoffDate
    );
  }
}

/**
 * Trace Span Class
 */
class TraceSpan {
  constructor(traceId, name, metadata = {}) {
    this.traceId = traceId;
    this.name = name;
    this.metadata = metadata;
    this.startTime = new Date();
    this.endTime = null;
    this.duration = null;
    this.children = [];
    this.tags = new Map();
    this.logs = [];
  }
  
  addTag(key, value) {
    this.tags.set(key, value);
    return this;
  }
  
  log(message, metadata = {}) {
    this.logs.push({
      timestamp: new Date(),
      message,
      metadata
    });
    return this;
  }
  
  createChild(name, metadata = {}) {
    const childId = `${this.traceId}_${this.children.length}`;
    const child = new TraceSpan(childId, name, metadata);
    this.children.push(child);
    return child;
  }
  
  end(metadata = {}) {
    this.endTime = new Date();
    this.duration = this.endTime - this.startTime;
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }
  
  toJSON() {
    return {
      traceId: this.traceId,
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      metadata: this.metadata,
      tags: Object.fromEntries(this.tags),
      logs: this.logs,
      children: this.children.map(child => child.toJSON())
    };
  }
}

/**
 * Alert Management System
 */
class AlertManager extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.alerts = new Map();
    this.alertRules = new Map();
    this.notifications = [];
    this.setupDefaultRules();
  }
  
  async initialize() {
    // Initialize alert channels (email, slack, webhook, etc.)
  }
  
  setupDefaultRules() {
    this.addRule('high_error_rate', {
      condition: (data) => data.value > 0.05,
      severity: 'critical',
      message: 'Error rate exceeded 5%',
      cooldown: 300000 // 5 minutes
    });
    
    this.addRule('slow_response_time', {
      condition: (data) => data.value > 5000,
      severity: 'warning',
      message: 'Response time exceeded 5 seconds',
      cooldown: 600000 // 10 minutes
    });
    
    this.addRule('service_down', {
      condition: (data) => data.status === 'down',
      severity: 'critical',
      message: 'Service is down',
      cooldown: 60000 // 1 minute
    });
  }
  
  addRule(name, rule) {
    this.alertRules.set(name, {
      ...rule,
      lastTriggered: null
    });
  }
  
  trigger(ruleName, data) {
    const rule = this.alertRules.get(ruleName);
    if (!rule) return;
    
    // Check cooldown
    if (rule.lastTriggered && 
        Date.now() - rule.lastTriggered < rule.cooldown) {
      return;
    }
    
    // Check condition
    if (rule.condition(data)) {
      const alert = this.createAlert(ruleName, rule, data);
      this.alerts.set(alert.id, alert);
      rule.lastTriggered = Date.now();
      
      this.sendNotification(alert);
      this.emit('alert_triggered', alert);
      
      return alert;
    }
  }
  
  createAlert(ruleName, rule, data) {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      rule: ruleName,
      severity: rule.severity,
      message: rule.message,
      data,
      timestamp: new Date(),
      status: 'active',
      acknowledged: false,
      resolvedAt: null
    };
  }
  
  sendNotification(alert) {
    const notification = {
      id: `notif_${Date.now()}`,
      alertId: alert.id,
      channel: this.getNotificationChannel(alert.severity),
      message: this.formatAlertMessage(alert),
      timestamp: new Date(),
      sent: false
    };
    
    this.notifications.push(notification);
    
    // In a real implementation, send to actual notification channels
    console.warn(`ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    notification.sent = true;
    return notification;
  }
  
  getNotificationChannel(severity) {
    const channels = {
      'critical': ['email', 'sms', 'slack'],
      'warning': ['email', 'slack'],
      'info': ['slack']
    };
    
    return channels[severity] || ['email'];
  }
  
  formatAlertMessage(alert) {
    return `🚨 ${alert.message}\n\nSeverity: ${alert.severity}\nTime: ${alert.timestamp}\nData: ${JSON.stringify(alert.data, null, 2)}`;
  }
  
  acknowledgeAlert(alertId, userId) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
      this.emit('alert_acknowledged', alert);
    }
    return alert;
  }
  
  resolveAlert(alertId, userId, resolution) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedBy = userId;
      alert.resolvedAt = new Date();
      alert.resolution = resolution;
      this.emit('alert_resolved', alert);
    }
    return alert;
  }
  
  getActiveAlerts() {
    return Array.from(this.alerts.values()).filter(alert => alert.status === 'active');
  }
  
  getAlertHistory(limit = 100) {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}

/**
 * Health Check System
 */
class HealthChecker {
  constructor(config) {
    this.config = config;
    this.services = new Map();
    this.healthHistory = [];
    this.setupDefaultServices();
  }
  
  async initialize() {
    // Initialize health check endpoints
  }
  
  setupDefaultServices() {
    this.registerService('database', {
      check: () => this.checkDatabase(),
      timeout: 5000,
      interval: 30000
    });
    
    this.registerService('ai_models', {
      check: () => this.checkAIModels(),
      timeout: 10000,
      interval: 60000
    });
    
    this.registerService('external_apis', {
      check: () => this.checkExternalAPIs(),
      timeout: 5000,
      interval: 30000
    });
  }
  
  registerService(name, config) {
    this.services.set(name, {
      ...config,
      status: 'unknown',
      lastCheck: null,
      lastSuccess: null,
      consecutiveFailures: 0
    });
  }
  
  async performHealthCheck() {
    const results = new Map();
    
    for (const [name, service] of this.services) {
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          service.check(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), service.timeout)
          )
        ]);
        
        const duration = Date.now() - startTime;
        
        service.status = 'healthy';
        service.lastCheck = new Date();
        service.lastSuccess = new Date();
        service.consecutiveFailures = 0;
        
        results.set(name, {
          status: 'healthy',
          duration,
          result,
          timestamp: new Date()
        });
        
      } catch (error) {
        service.status = 'unhealthy';
        service.lastCheck = new Date();
        service.consecutiveFailures++;
        
        results.set(name, {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date()
        });
        
        // Emit service down event for alerting
        if (service.consecutiveFailures >= 3) {
          this.emit('service_down', { service: name, error: error.message });
        }
      }
    }
    
    const overallHealth = this.calculateOverallHealth(results);
    this.healthHistory.push({
      timestamp: new Date(),
      overall: overallHealth,
      services: Object.fromEntries(results)
    });
    
    // Keep history manageable
    if (this.healthHistory.length > 1000) {
      this.healthHistory = this.healthHistory.slice(-500);
    }
    
    return { overall: overallHealth, services: Object.fromEntries(results) };
  }
  
  calculateOverallHealth(results) {
    const total = results.size;
    const healthy = Array.from(results.values()).filter(r => r.status === 'healthy').length;
    
    if (healthy === total) return 'healthy';
    if (healthy === 0) return 'unhealthy';
    return 'degraded';
  }
  
  async getOverallHealth() {
    const latest = this.healthHistory[this.healthHistory.length - 1];
    if (!latest || Date.now() - latest.timestamp > 60000) {
      return await this.performHealthCheck();
    }
    return latest;
  }
  
  async checkDatabase() {
    // Mock database check
    return { connected: true, latency: Math.random() * 10 };
  }
  
  async checkAIModels() {
    // Mock AI model check
    return { available: true, models: ['gpt-4', 'claude-3'] };
  }
  
  async checkExternalAPIs() {
    // Mock external API check
    return { apis: { openai: 'ok', anthropic: 'ok' } };
  }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
  constructor(config) {
    this.config = config;
    this.measurements = [];
    this.benchmarks = new Map();
    this.setupBenchmarks();
  }
  
  async initialize() {
    // Initialize performance monitoring
  }
  
  setupBenchmarks() {
    this.benchmarks.set('agent_response_time', { target: 2000, threshold: 5000 });
    this.benchmarks.set('api_response_time', { target: 500, threshold: 2000 });
    this.benchmarks.set('database_query_time', { target: 100, threshold: 1000 });
    this.benchmarks.set('memory_usage', { target: 0.7, threshold: 0.9 });
    this.benchmarks.set('cpu_usage', { target: 0.5, threshold: 0.8 });
  }
  
  measure(operation, duration, metadata = {}) {
    const measurement = {
      operation,
      duration,
      metadata,
      timestamp: new Date()
    };
    
    this.measurements.push(measurement);
    
    // Keep measurements manageable
    if (this.measurements.length > 10000) {
      this.measurements = this.measurements.slice(-5000);
    }
    
    // Check against benchmarks
    const benchmark = this.benchmarks.get(operation);
    if (benchmark && duration > benchmark.threshold) {
      this.emit('performance_issue', {
        operation,
        duration,
        benchmark,
        metadata
      });
    }
    
    return measurement;
  }
  
  async analyzePerformance() {
    const analysis = {
      timestamp: new Date(),
      operations: {}
    };
    
    // Group measurements by operation
    const operationGroups = this.groupMeasurementsByOperation();
    
    for (const [operation, measurements] of operationGroups) {
      const stats = this.calculateStats(measurements);
      const benchmark = this.benchmarks.get(operation);
      
      analysis.operations[operation] = {
        ...stats,
        benchmark,
        performance: this.assessPerformance(stats, benchmark)
      };
    }
    
    return analysis;
  }
  
  groupMeasurementsByOperation() {
    const groups = new Map();
    
    for (const measurement of this.measurements) {
      if (!groups.has(measurement.operation)) {
        groups.set(measurement.operation, []);
      }
      groups.get(measurement.operation).push(measurement);
    }
    
    return groups;
  }
  
  calculateStats(measurements) {
    const durations = measurements.map(m => m.duration);
    durations.sort((a, b) => a - b);
    
    return {
      count: durations.length,
      min: durations[0],
      max: durations[durations.length - 1],
      avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)]
    };
  }
  
  assessPerformance(stats, benchmark) {
    if (!benchmark) return 'unknown';
    
    if (stats.p95 <= benchmark.target) return 'excellent';
    if (stats.p95 <= benchmark.threshold) return 'good';
    return 'poor';
  }
  
  async getReport(timeRange = '1h') {
    const cutoff = new Date(Date.now() - this.parseTimeRange(timeRange));
    const recentMeasurements = this.measurements.filter(m => m.timestamp > cutoff);
    
    return this.analyzePerformance(recentMeasurements);
  }
  
  parseTimeRange(range) {
    const units = { 'm': 60000, 'h': 3600000, 'd': 86400000 };
    const match = range.match(/^(\d+)([mhd])$/);
    if (match) {
      return parseInt(match[1]) * units[match[2]];
    }
    return 3600000; // Default to 1 hour
  }
}

/**
 * Error Tracking System
 */
class ErrorTracker extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.errors = [];
    this.errorPatterns = new Map();
    this.maxErrors = config.maxErrors || 10000;
  }
  
  async initialize() {
    // Initialize error tracking
  }
  
  recordError(error, context = {}) {
    const errorRecord = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      context,
      timestamp: new Date(),
      fingerprint: this.generateFingerprint(error),
      severity: this.determineSeverity(error, context)
    };
    
    this.errors.push(errorRecord);
    
    // Maintain error history size
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-Math.floor(this.maxErrors * 0.8));
    }
    
    // Track error patterns
    this.trackErrorPattern(errorRecord);
    
    // Emit for alerting
    if (errorRecord.severity === 'critical') {
      this.emit('critical_error', errorRecord);
    }
    
    return errorRecord;
  }
  
  generateFingerprint(error) {
    // Create a fingerprint for grouping similar errors
    const key = `${error.constructor.name}:${error.message}`;
    return Buffer.from(key).toString('base64');
  }
  
  determineSeverity(error, context) {
    // Determine error severity based on type and context
    const criticalTypes = ['ReferenceError', 'TypeError', 'SyntaxError'];
    const criticalContexts = ['payment', 'auth', 'security'];
    
    if (criticalTypes.includes(error.constructor.name)) return 'critical';
    if (criticalContexts.some(ctx => context.operation?.includes(ctx))) return 'critical';
    if (context.userId) return 'warning';
    return 'info';
  }
  
  trackErrorPattern(errorRecord) {
    const pattern = this.errorPatterns.get(errorRecord.fingerprint);
    
    if (pattern) {
      pattern.count++;
      pattern.lastSeen = errorRecord.timestamp;
      pattern.recent.push(errorRecord.timestamp);
      
      // Keep only recent occurrences
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
      pattern.recent = pattern.recent.filter(time => time > cutoff);
      
    } else {
      this.errorPatterns.set(errorRecord.fingerprint, {
        fingerprint: errorRecord.fingerprint,
        message: errorRecord.message,
        type: errorRecord.type,
        count: 1,
        firstSeen: errorRecord.timestamp,
        lastSeen: errorRecord.timestamp,
        recent: [errorRecord.timestamp]
      });
    }
  }
  
  getErrorSummary(timeRange = '1h') {
    const cutoff = new Date(Date.now() - this.parseTimeRange(timeRange));
    const recentErrors = this.errors.filter(e => e.timestamp > cutoff);
    
    const summary = {
      total: recentErrors.length,
      bySeverity: this.groupBy(recentErrors, 'severity'),
      byType: this.groupBy(recentErrors, 'type'),
      topPatterns: this.getTopErrorPatterns(10),
      timeRange
    };
    
    return summary;
  }
  
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }
  
  getTopErrorPatterns(limit = 10) {
    return Array.from(this.errorPatterns.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  parseTimeRange(range) {
    const units = { 'm': 60000, 'h': 3600000, 'd': 86400000 };
    const match = range.match(/^(\d+)([mhd])$/);
    if (match) {
      return parseInt(match[1]) * units[match[2]];
    }
    return 3600000; // Default to 1 hour
  }
  
  async cleanup(cutoffDate) {
    this.errors = this.errors.filter(error => error.timestamp > cutoffDate);
    
    // Clean up error patterns
    for (const [fingerprint, pattern] of this.errorPatterns) {
      if (pattern.lastSeen < cutoffDate) {
        this.errorPatterns.delete(fingerprint);
      }
    }
  }
}

/**
 * User Analytics System
 */
class UserAnalytics {
  constructor(config) {
    this.config = config;
    this.events = [];
    this.sessions = new Map();
    this.userProfiles = new Map();
    this.maxEvents = config.maxEvents || 50000;
  }
  
  async initialize() {
    // Initialize analytics tracking
  }
  
  trackEvent(userId, event, properties = {}) {
    const eventRecord = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      event,
      properties,
      timestamp: new Date(),
      sessionId: this.getOrCreateSession(userId).id
    };
    
    this.events.push(eventRecord);
    
    // Maintain event history size
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-Math.floor(this.maxEvents * 0.8));
    }
    
    // Update user profile
    this.updateUserProfile(userId, eventRecord);
    
    return eventRecord;
  }
  
  getOrCreateSession(userId) {
    const existingSession = Array.from(this.sessions.values())
      .find(s => s.userId === userId && this.isSessionActive(s));
    
    if (existingSession) {
      existingSession.lastActivity = new Date();
      return existingSession;
    }
    
    const newSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      events: 0
    };
    
    this.sessions.set(newSession.id, newSession);
    return newSession;
  }
  
  isSessionActive(session) {
    const timeout = 30 * 60 * 1000; // 30 minutes
    return Date.now() - session.lastActivity.getTime() < timeout;
  }
  
  updateUserProfile(userId, event) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        totalEvents: 0,
        uniqueEvents: new Set(),
        sessions: 0
      });
    }
    
    const profile = this.userProfiles.get(userId);
    profile.lastSeen = event.timestamp;
    profile.totalEvents++;
    profile.uniqueEvents.add(event.event);
  }
  
  getUserAnalytics(userId, timeRange = '30d') {
    const cutoff = new Date(Date.now() - this.parseTimeRange(timeRange));
    const userEvents = this.events.filter(e => 
      e.userId === userId && e.timestamp > cutoff
    );
    
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId && s.startTime > cutoff);
    
    return {
      userId,
      timeRange,
      events: {
        total: userEvents.length,
        unique: new Set(userEvents.map(e => e.event)).size,
        byType: this.groupBy(userEvents, 'event')
      },
      sessions: {
        total: userSessions.length,
        avgDuration: this.calculateAvgSessionDuration(userSessions),
        totalTime: this.calculateTotalSessionTime(userSessions)
      },
      profile: this.userProfiles.get(userId)
    };
  }
  
  getSystemAnalytics(timeRange = '24h') {
    const cutoff = new Date(Date.now() - this.parseTimeRange(timeRange));
    const recentEvents = this.events.filter(e => e.timestamp > cutoff);
    const recentSessions = Array.from(this.sessions.values())
      .filter(s => s.startTime > cutoff);
    
    return {
      timeRange,
      events: {
        total: recentEvents.length,
        uniqueUsers: new Set(recentEvents.map(e => e.userId)).size,
        byType: this.groupBy(recentEvents, 'event'),
        byHour: this.groupEventsByHour(recentEvents)
      },
      sessions: {
        total: recentSessions.length,
        uniqueUsers: new Set(recentSessions.map(s => s.userId)).size,
        avgDuration: this.calculateAvgSessionDuration(recentSessions)
      },
      users: {
        total: this.userProfiles.size,
        active: new Set(recentEvents.map(e => e.userId)).size
      }
    };
  }
  
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }
  
  groupEventsByHour(events) {
    const hourGroups = {};
    
    for (const event of events) {
      const hour = event.timestamp.getHours();
      hourGroups[hour] = (hourGroups[hour] || 0) + 1;
    }
    
    return hourGroups;
  }
  
  calculateAvgSessionDuration(sessions) {
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => {
      const duration = session.lastActivity - session.startTime;
      return sum + duration;
    }, 0);
    
    return totalDuration / sessions.length;
  }
  
  calculateTotalSessionTime(sessions) {
    return sessions.reduce((sum, session) => {
      return sum + (session.lastActivity - session.startTime);
    }, 0);
  }
  
  parseTimeRange(range) {
    const units = { 'm': 60000, 'h': 3600000, 'd': 86400000 };
    const match = range.match(/^(\d+)([mhd])$/);
    if (match) {
      return parseInt(match[1]) * units[match[2]];
    }
    return 86400000; // Default to 1 day
  }
  
  async cleanup(cutoffDate) {
    this.events = this.events.filter(event => event.timestamp > cutoffDate);
    
    // Clean up old sessions
    for (const [sessionId, session] of this.sessions) {
      if (session.lastActivity < cutoffDate) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Export the main observability system
export default ObservabilitySystem;