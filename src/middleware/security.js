import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import xssClean from 'xss-clean';
import hpp from 'hpp';

export default function registerSecurityMiddleware(app) {
  // 1. Basic security headers with strict CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // 2. Prevent HTTP Parameter Pollution
  app.use(hpp());

  // 3. XSS protection
  app.use(xssClean());

  // 4. CORS with strict configuration
  const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['https://flashfusion.ai'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));

  // 5. Rate limiting with different tiers
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || (process.env.NODE_ENV === 'production' ? 100 : 1000),
    message: {
      status: 429,
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/metrics';
    }
  });
  app.use(limiter);

  // 6. API-specific stricter rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 50 : 500,
    message: {
      status: 429,
      error: 'API rate limit exceeded',
    }
  });
  app.use('/api/', apiLimiter);

  // 7. Auth endpoint rate limiting (very strict)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 auth attempts per 15 minutes
    message: {
      status: 429,
      error: 'Too many authentication attempts',
    }
  });
  app.use('/api/auth/', authLimiter);
}