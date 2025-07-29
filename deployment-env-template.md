# FlashFusion Environment Variables for Deployment

## Required Production Environment Variables

### Security (Required)
```bash
# JWT secret for token authentication - REQUIRED in production
JWT_SECRET=your-secure-jwt-secret-key-here

# Application encryption key
ENCRYPTION_KEY=your-32-char-encryption-key-here
```

### Database Configuration (Recommended)
```bash
# Supabase database connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

### AI Services (Optional but Recommended)
```bash
# OpenAI for AI features
OPENAI_API_KEY=sk-your-openai-key

# Anthropic Claude for AI features
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Google Gemini (optional)
GEMINI_API_KEY=your-gemini-api-key
```

### Integration Services (Optional)
```bash
# GitHub integration
GITHUB_TOKEN=ghp_your-github-token

# Vercel integration
VERCEL_TOKEN=your-vercel-token

# Shopify integration
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-secret

# Stripe payments
STRIPE_SECRET_KEY=sk_live_your-stripe-secret

# Social media integrations
TWITTER_API_KEY=your-twitter-key
TWITTER_API_SECRET=your-twitter-secret
LINKEDIN_CLIENT_ID=your-linkedin-id
LINKEDIN_CLIENT_SECRET=your-linkedin-secret

# Google services
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_ANALYTICS_ID=GA-your-analytics-id
```

### Application Settings
```bash
# Application environment
NODE_ENV=production
APP_VERSION=2.0.0
PORT=3000

# CORS settings
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Features
ENABLE_AI_AGENTS=true
ENABLE_WORKFLOWS=true
ENABLE_INTEGRATIONS=true

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Deployment Notes

### Critical Requirements
- `JWT_SECRET` is **required** in production and must be set to a secure random string
- Without database credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`), the app runs in offline mode with limited functionality
- At least one AI API key (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`) is recommended for full AI features

### Graceful Degradation
The application is designed to handle missing environment variables gracefully:
- Missing database credentials: App runs in offline mode
- Missing AI keys: AI features are disabled
- Missing integrations: Specific integrations are disabled

### Security Best Practices
1. Use strong, unique values for `JWT_SECRET` and `ENCRYPTION_KEY`
2. Store all secrets securely in your deployment platform's secret management
3. Never commit actual secret values to version control
4. Rotate secrets regularly

### Testing Deployment
Before deploying, you can test locally by setting NODE_ENV=production and running:
```bash
npm run validate
npm run health
```