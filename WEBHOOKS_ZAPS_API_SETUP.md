# FlashFusion Webhooks, Zaps & API Access Setup

## 🚀 Overview

FlashFusion now includes a comprehensive integration system with:

- **🔗 Webhooks**: Connect with external services and receive real-time notifications
- **⚡ Zapier Integration**: Automate workflows with 5,000+ apps
- **🔐 API Access**: Secure authentication and rate-limited API access
- **📊 Management Dashboards**: Visual interfaces for monitoring and configuration

## 🛠️ Quick Setup

### 1. Run the Setup Script

```bash
npm run setup:integrations
```

This will:
- ✅ Test all API endpoints
- ✅ Generate API keys
- ✅ Validate webhook functionality
- ✅ Test Zapier integration
- ✅ Create documentation

### 2. Access Your Dashboards

- **Authentication Dashboard**: `http://localhost:3000/api/auth/dashboard`
- **Webhook Manager**: `http://localhost:3000/api/webhooks`
- **API Status**: `http://localhost:3000/api/status`

## 🔐 Authentication System

### Generate API Key

```bash
curl -X POST http://localhost:3000/api/auth/generate-key \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "email": "developer@company.com",
    "tier": "premium"
  }'
```

### API Tiers

| Tier | Rate Limit | Features |
|------|------------|----------|
| Free | 100 req/hour | Basic webhooks, Community support |
| Premium | 1,000 req/hour | Advanced webhooks, Priority support |
| Enterprise | Unlimited | Custom integrations, Dedicated support |

### Using Your API Key

Include in headers:
```
X-API-Key: ff_your_64_character_api_key_here
```

## 🔗 Webhook System

### Available Webhooks

| Service | Endpoint | Purpose |
|---------|----------|---------|
| **Generic** | `/api/webhooks/test` | Testing and development |
| **Zapier** | `/api/webhooks/zapier` | Zapier automation triggers |
| **Stripe** | `/api/webhooks/stripe` | Payment processing events |
| **Shopify** | `/api/webhooks/shopify` | E-commerce events |
| **GitHub** | `/api/webhooks/github` | Repository events |
| **Slack** | `/api/webhooks/slack` | Team communication |
| **Discord** | `/api/webhooks/discord` | Community management |

### Webhook Security

- **Authentication**: All webhooks require API key authentication
- **Signature Verification**: HMAC-SHA256 signature validation
- **Rate Limiting**: Tier-based request limits
- **CORS**: Properly configured cross-origin support

### Testing Webhooks

```bash
# Test generic webhook
curl -X POST http://localhost:3000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"test": true, "message": "Hello FlashFusion!"}'
```

## ⚡ Zapier Integration

### Setup in Zapier

1. **Create a new Zap** in your Zapier dashboard
2. **Choose trigger app**: "Webhooks by Zapier"
3. **Select event**: "Catch Hook"
4. **Set webhook URL**: `https://your-domain.com/api/webhooks/zapier`
5. **Add authentication header**: `X-API-Key: your_api_key`

### Available Triggers

FlashFusion can trigger Zapier automations for:

- `new_lead` - When a new lead is generated
- `new_customer` - When a customer registers
- `new_order` - When an order is placed
- `workflow_completed` - When an AI workflow finishes
- `agent_response` - When an AI agent responds
- `task_completed` - When a task is finished
- `error_occurred` - When system errors occur

### Available Actions

Zapier can trigger FlashFusion actions:

- `create_lead` - Create a new lead
- `send_email` - Send an email
- `create_task` - Create a new task
- `update_customer` - Update customer information
- `trigger_workflow` - Start an AI workflow
- `create_agent` - Create a new AI agent

### Zapier API Endpoints

```bash
# Get integration info
GET /api/webhooks/zapier/info

# List available triggers
GET /api/webhooks/zapier/triggers

# List available actions
GET /api/webhooks/zapier/actions

# Test specific trigger
GET /api/webhooks/zapier/trigger/new_lead?limit=5

# Execute action
POST /api/webhooks/zapier/action/create_lead
```

### Example Zapier Workflows

#### 1. New Lead → CRM Integration
```
Trigger: FlashFusion New Lead
↓
Action: Create Salesforce Contact
↓
Action: Send Welcome Email
↓
Action: Notify Sales Team in Slack
```

#### 2. Workflow Complete → Project Updates
```
Trigger: FlashFusion Workflow Completed
↓
Action: Update Asana Task
↓
Action: Send Teams Notification
↓
Action: Create Follow-up Tasks
```

#### 3. E-commerce Order → Multi-Platform Sync
```
Trigger: FlashFusion New Order
↓
Action: Update Inventory in Shopify
↓
Action: Generate Invoice in QuickBooks
↓
Action: Create Shipping Label
↓
Action: Send Order Confirmation
```

## 📊 API Documentation

### Authentication Endpoints

```bash
# Generate API key
POST /api/auth/generate-key
{
  "name": "Project Name",
  "email": "user@example.com", 
  "tier": "premium"
}

# Validate API key
GET /api/auth/validate-key
Headers: X-API-Key: your_key

# Get usage statistics
GET /api/auth/usage
Headers: X-API-Key: your_key

# Revoke API key (admin only)
DELETE /api/auth/revoke-key/{keyId}
Headers: X-Admin-Key: admin_key
```

### Webhook Management

```bash
# List all webhooks
GET /api/webhooks

# Get webhook statistics
GET /api/webhooks/stats

# Test webhook endpoint
POST /api/webhooks/test
Headers: X-API-Key: your_key
```

### Zapier Integration

```bash
# Get Zapier info
GET /api/webhooks/zapier/info
Headers: X-API-Key: your_key

# Poll for new leads (Zapier trigger)
GET /api/webhooks/zapier/trigger/new_lead?limit=10&since=2025-01-24T00:00:00Z
Headers: X-API-Key: your_key

# Create lead (Zapier action)
POST /api/webhooks/zapier/action/create_lead
Headers: X-API-Key: your_key
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Tech Corp",
  "source": "zapier"
}
```

## 🧪 Testing Your Setup

### Run All Tests

```bash
npm run test:webhooks
```

### Individual Tests

```bash
# Test API status
npm run test:api

# Test authentication
npm run test:auth

# Test Zapier integration
npm run test:zapier
```

### Manual Testing

```bash
# Test webhook with curl
curl -X POST http://localhost:3000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"test": true}'

# Test Zapier trigger
curl -X GET "http://localhost:3000/api/webhooks/zapier/trigger/new_lead?limit=5" \
  -H "X-API-Key: your_api_key"

# Test Zapier action
curl -X POST http://localhost:3000/api/webhooks/zapier/action/create_lead \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"name": "Test Lead", "email": "test@example.com"}'
```

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
BASE_URL=https://your-domain.com
ADMIN_KEY=your_secure_admin_key

# Zapier Configuration
ZAPIER_WEBHOOK_SECRET=your_zapier_secret
ZAPIER_GITHUB_WEBHOOK_URL=https://hooks.zapier.com/...
ZAPIER_CHECKPOINT_WEBHOOK_URL=https://hooks.zapier.com/...

# Database (optional - uses in-memory storage by default)
DATABASE_URL=your_database_connection_string
```

### Deployment

The system works with:
- ✅ **Vercel** (recommended)
- ✅ **Netlify Functions**
- ✅ **AWS Lambda**
- ✅ **Google Cloud Functions**
- ✅ **Traditional servers**

## 📈 Monitoring & Analytics

### Webhook Statistics

Access real-time statistics at:
- `/api/webhooks/stats` - Overall webhook performance
- `/api/auth/usage` - API usage by key
- `/api/webhooks/zapier/info` - Zapier integration status

### Rate Limiting

- **Free Tier**: 100 requests/hour
- **Premium Tier**: 1,000 requests/hour  
- **Enterprise Tier**: Unlimited

Rate limit headers included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1643723400
```

## 🛡️ Security Features

- **API Key Authentication**: Secure 64-character keys
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **CORS Protection**: Properly configured cross-origin policies
- **Signature Verification**: HMAC-SHA256 webhook validation
- **Request Logging**: Comprehensive audit trails
- **Error Handling**: Graceful failure management

## 🚨 Troubleshooting

### Common Issues

**❌ "Authentication required" error**
```bash
# Solution: Include API key in header
curl -H "X-API-Key: your_api_key" ...
```

**❌ "Rate limit exceeded" error**
```bash
# Solution: Upgrade tier or wait for reset
# Check rate limit status:
curl -I http://localhost:3000/api/status
```

**❌ Zapier webhook not triggering**
```bash
# Solution: Test webhook endpoint directly
curl -X POST http://localhost:3000/api/webhooks/zapier/test \
  -H "X-API-Key: your_api_key"
```

### Debug Mode

Enable detailed logging:
```bash
DEBUG=flashfusion:* npm start
```

### Support

- **Documentation**: [FlashFusion Docs](https://flashfusion.co/docs)
- **API Reference**: `/api/auth/docs`
- **Status Page**: `/api/status`
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/FlashFusion-Unified/issues)

## 🎯 Next Steps

1. **Generate your API key** using the setup script
2. **Create your first Zapier automation** 
3. **Set up webhook endpoints** for your services
4. **Monitor usage** through the dashboards
5. **Scale up** to premium tier as needed

---

## 📚 Additional Resources

- [Zapier Developer Platform](https://platform.zapier.com/)
- [Webhook Security Best Practices](https://webhooks.fyi/)
- [API Design Guidelines](https://restfulapi.net/)
- [FlashFusion Documentation](https://flashfusion.co/docs)

**🎉 Your FlashFusion integration system is now ready for production!**