import * as Sentry from '@sentry/node';

export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('SENTRY_DSN not provided, Sentry monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    org: "flashfusion",
    project: "javascript-nextjs",
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session tracking
    autoSessionTracking: true,
    
    // Profiling disabled (profiling-node package removed)
    // profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors from health checks
      if (event.request?.url?.includes('/health')) {
        return null;
      }
      
      // Don't send 4xx errors unless they're authentication related
      if (event.tags?.status_code >= 400 && event.tags?.status_code < 500) {
        if (!event.request?.url?.includes('/auth')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Additional configuration
    maxBreadcrumbs: 100,
    debug: process.env.NODE_ENV === 'development',
    
    // Set user context
    initialScope: scope => {
      scope.setTag('service', 'flashfusion-unified');
      scope.setTag('version', process.env.npm_package_version || '1.0.0');
      return scope;
    }
  });

  console.log('Sentry initialized successfully');
}

export function setupSentryMiddleware(app) {
  // Request handler must be the first middleware
  app.use(Sentry.Handlers.requestHandler({
    user: ['id', 'email', 'role'],
    request: ['method', 'url', 'headers', 'query'],
    serverName: false
  }));

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}

export function setupSentryErrorHandler(app) {
  // Error handler must be before any other error middleware
  app.use(Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all 4xx and 5xx errors
      return error.status >= 400;
    }
  }));
}

// Custom error reporting functions
export function captureException(error, context = {}) {
  Sentry.withScope(scope => {
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key]);
    });
    Sentry.captureException(error);
  });
}

export function captureMessage(message, level = 'info', context = {}) {
  Sentry.withScope(scope => {
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key]);
    });
    Sentry.captureMessage(message, level);
  });
}

export function setUserContext(user) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role
  });
}

export function addBreadcrumb(message, category = 'custom', level = 'info', data = {}) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000
  });
}

// Performance monitoring helpers
export function startTransaction(name, op = 'http') {
  return Sentry.startTransaction({
    name,
    op,
    tags: {
      service: 'flashfusion-unified'
    }
  });
}

export function measureAsyncOperation(name, operation) {
  return async (...args) => {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
    const span = transaction?.startChild({
      op: 'function',
      description: name
    });

    try {
      const result = await operation(...args);
      span?.setStatus('ok');
      return result;
    } catch (error) {
      span?.setStatus('internal_error');
      throw error;
    } finally {
      span?.finish();
    }
  };
}