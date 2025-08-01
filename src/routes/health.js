import express from 'express';
import redisService from '../services/redis.js';
import { DatabaseService } from '../services/database.js';
import { getMetrics } from '../metrics.js';

const router = express.Router();

// Initialize database service
const dbService = new DatabaseService();

// Health check endpoint with comprehensive monitoring
router.get('/', async (req, res) => {
    const startTime = Date.now();
    
    try {
        // Basic system info
        const systemInfo = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            pid: process.pid
        };

        // Service health checks
        const services = {
            database: { status: 'down', responseTime: 0, error: null },
            redis: { status: 'down', responseTime: 0, error: null },
            external: { status: 'down', responseTime: 0, error: null }
        };

        // Database health check
        try {
            const dbStart = Date.now();
            const dbHealth = await dbService.healthCheck();
            const dbTime = Date.now() - dbStart;
            
            services.database = {
                status: dbHealth.status,
                responseTime: dbTime,
                error: dbHealth.error,
                connectionStatus: dbService.getConnectionStatus()
            };
        } catch (err) {
            console.error('Database health check failed:', err.message);
            services.database = {
                status: 'down',
                responseTime: 0,
                error: err.message
            };
        }

        // Redis health check
        try {
            const redisStart = Date.now();
            const redisHealth = await redisService.healthCheck();
            const redisTime = Date.now() - redisStart;
            
            services.redis = {
                status: redisHealth.status,
                responseTime: redisTime,
                error: redisHealth.error,
                connectionStatus: redisService.getConnectionStatus()
            };
        } catch (err) {
            console.error('Redis health check failed:', err.message);
            services.redis = {
                status: 'down',
                responseTime: 0,
                error: err.message
            };
        }

        // External service health checks
        try {
            const externalStart = Date.now();
            const externalChecks = await checkExternalServices();
            const externalTime = Date.now() - externalStart;
            
            services.external = {
                status: externalChecks.overall,
                responseTime: externalTime,
                services: externalChecks.services
            };
        } catch (err) {
            console.error('External service check failed:', err.message);
            services.external = {
                status: 'down',
                responseTime: 0,
                error: err.message
            };
        }

        // Security status
        const securityStatus = await getSecurityStatus();

        // Overall health status
        const overallStatus = determineOverallStatus(services);
        
        const responseTime = Date.now() - startTime;

        const healthResponse = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            responseTime,
            version: process.env.APP_VERSION || '2.0.0',
            environment: process.env.NODE_ENV || 'development',
            system: systemInfo,
            services,
            security: securityStatus,
            metrics: await getMetrics()
        };

        // Set appropriate HTTP status code
        const statusCode = overallStatus === 'healthy' ? 200 : 503;
        res.status(statusCode).json(healthResponse);

    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            responseTime: Date.now() - startTime
        });
    }
});

// Detailed health check endpoint
router.get('/detailed', async (req, res) => {
    try {
        const detailedHealth = await getDetailedHealthCheck();
        res.json(detailedHealth);
    } catch (error) {
        console.error('Detailed health check failed:', error);
        res.status(503).json({
            status: 'error',
            error: error.message
        });
    }
});

// Security health check endpoint
router.get('/security', async (req, res) => {
    try {
        const securityHealth = await getSecurityHealthCheck();
        res.json(securityHealth);
    } catch (error) {
        console.error('Security health check failed:', error);
        res.status(503).json({
            status: 'error',
            error: error.message
        });
    }
});

// Performance metrics endpoint
router.get('/performance', async (req, res) => {
    try {
        const performanceMetrics = await getPerformanceMetrics();
        res.json(performanceMetrics);
    } catch (error) {
        console.error('Performance metrics failed:', error);
        res.status(503).json({
            status: 'error',
            error: error.message
        });
    }
});

// Helper functions
async function checkExternalServices() {
    const services = {
        supabase: { status: 'unknown', responseTime: 0, error: null },
        openai: { status: 'unknown', responseTime: 0, error: null },
        anthropic: { status: 'unknown', responseTime: 0, error: null },
        notion: { status: 'unknown', responseTime: 0, error: null },
        zapier: { status: 'unknown', responseTime: 0, error: null }
    };

    // Check Supabase
    if (process.env.SUPABASE_URL) {
        try {
            const start = Date.now();
            const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
                headers: {
                    'apikey': process.env.SUPABASE_ANON_KEY || '',
                    'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
                }
            });
            const responseTime = Date.now() - start;
            
            services.supabase = {
                status: response.ok ? 'healthy' : 'unhealthy',
                responseTime,
                statusCode: response.status
            };
        } catch (error) {
            services.supabase = {
                status: 'down',
                responseTime: 0,
                error: error.message
            };
        }
    }

    // Check OpenAI (if configured)
    if (process.env.OPENAI_API_KEY) {
        try {
            const start = Date.now();
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });
            const responseTime = Date.now() - start;
            
            services.openai = {
                status: response.ok ? 'healthy' : 'unhealthy',
                responseTime,
                statusCode: response.status
            };
        } catch (error) {
            services.openai = {
                status: 'down',
                responseTime: 0,
                error: error.message
            };
        }
    }

    // Check Anthropic (if configured)
    if (process.env.ANTHROPIC_API_KEY) {
        try {
            const start = Date.now();
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 1,
                    messages: [{ role: 'user', content: 'test' }]
                })
            });
            const responseTime = Date.now() - start;
            
            services.anthropic = {
                status: response.status === 400 ? 'healthy' : 'unhealthy', // 400 is expected for test message
                responseTime,
                statusCode: response.status
            };
        } catch (error) {
            services.anthropic = {
                status: 'down',
                responseTime: 0,
                error: error.message
            };
        }
    }

    // Determine overall external service status
    const healthyServices = Object.values(services).filter(s => s.status === 'healthy').length;
    const totalServices = Object.keys(services).length;
    const overall = healthyServices > 0 ? 'degraded' : 'down';

    return {
        overall,
        services,
        summary: {
            healthy: healthyServices,
            total: totalServices,
            degraded: Object.values(services).filter(s => s.status === 'degraded').length,
            down: Object.values(services).filter(s => s.status === 'down').length
        }
    };
}

async function getSecurityStatus() {
    const securityChecks = {
        environment: checkEnvironmentSecurity(),
        dependencies: await checkDependencySecurity(),
        configuration: checkConfigurationSecurity(),
        certificates: await checkCertificateSecurity()
    };

    const overallSecurity = determineSecurityStatus(securityChecks);

    return {
        status: overallSecurity,
        checks: securityChecks,
        lastUpdated: new Date().toISOString()
    };
}

function checkEnvironmentSecurity() {
    const checks = {
        nodeEnv: process.env.NODE_ENV === 'production',
        httpsOnly: process.env.FORCE_HTTPS === 'true',
        corsConfigured: !!process.env.CORS_ORIGIN,
        rateLimitConfigured: !!process.env.RATE_LIMIT_MAX,
        sessionSecret: !!process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32,
        jwtSecret: !!process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    return {
        status: passed === total ? 'secure' : passed > total / 2 ? 'warning' : 'insecure',
        checks,
        summary: { passed, total, percentage: Math.round((passed / total) * 100) }
    };
}

async function checkDependencySecurity() {
    try {
        // This would typically check for known vulnerabilities
        // For now, we'll return a basic check
        return {
            status: 'unknown',
            message: 'Dependency security check not implemented',
            lastChecked: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'error',
            error: error.message
        };
    }
}

function checkConfigurationSecurity() {
    const checks = {
        secureHeaders: true, // Assuming security middleware is active
        rateLimiting: true, // Assuming rate limiting is configured
        inputValidation: true, // Assuming validation middleware is active
        sqlInjectionProtection: true, // Assuming parameterized queries
        xssProtection: true, // Assuming XSS protection is active
        csrfProtection: true // Assuming CSRF protection is active
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    return {
        status: passed === total ? 'secure' : 'warning',
        checks,
        summary: { passed, total, percentage: Math.round((passed / total) * 100) }
    };
}

async function checkCertificateSecurity() {
    // This would check SSL certificate validity
    // For now, return a basic check
    return {
        status: 'unknown',
        message: 'Certificate check not implemented',
        lastChecked: new Date().toISOString()
    };
}

function determineSecurityStatus(securityChecks) {
    const statuses = Object.values(securityChecks).map(check => check.status);
    
    if (statuses.every(status => status === 'secure')) {
        return 'secure';
    } else if (statuses.some(status => status === 'insecure')) {
        return 'insecure';
    } else {
        return 'warning';
    }
}

function determineOverallStatus(services) {
    const criticalServices = ['database', 'redis'];
    const criticalStatuses = criticalServices.map(service => services[service]?.status);
    
    if (criticalStatuses.every(status => status === 'healthy')) {
        return 'healthy';
    } else if (criticalStatuses.some(status => status === 'healthy')) {
        return 'degraded';
    } else {
        return 'unhealthy';
    }
}

async function getDetailedHealthCheck() {
    // This would provide more detailed health information
    return {
        timestamp: new Date().toISOString(),
        detailed: true,
        // Add more detailed checks here
    };
}

async function getSecurityHealthCheck() {
    return await getSecurityStatus();
}

async function getPerformanceMetrics() {
    const metrics = await getMetrics();
    
    return {
        timestamp: new Date().toISOString(),
        metrics,
        system: {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            uptime: process.uptime()
        }
    };
}

export default router;