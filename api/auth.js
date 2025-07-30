/**
 * FlashFusion API Authentication & Access Management
 * Handles API keys, rate limiting, and secure access control
 */

const crypto = require('crypto');

// In-memory storage (in production, use a database)
const apiKeys = new Map();
const rateLimits = new Map();
const apiUsage = new Map();

module.exports = async (req, res) => {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        const url = req.url || '/';
        const method = req.method;

        console.log('Auth API request:', {
            url,
            method,
            timestamp: new Date().toISOString()
        });

        // Route to different auth endpoints
        if (method === 'POST' && url === '/generate-key') {
            return handleGenerateApiKey(req, res);
        }

        if (method === 'GET' && url === '/validate-key') {
            return handleValidateApiKey(req, res);
        }

        if (method === 'DELETE' && url.startsWith('/revoke-key/')) {
            return handleRevokeApiKey(req, res);
        }

        if (method === 'GET' && url === '/usage') {
            return handleGetUsage(req, res);
        }

        if (method === 'GET' && url === '/dashboard') {
            return handleAuthDashboard(req, res);
        }

        if (method === 'GET' && url === '/docs') {
            return handleApiDocs(req, res);
        }

        // Default auth info
        return res.status(200).json({
            message: 'FlashFusion API Authentication',
            endpoints: [
                'POST /generate-key - Generate new API key', // Ensure this line ends with CRLF
                'GET /validate-key - Validate API key',
                'DELETE /revoke-key/:keyId - Revoke API key',
                'GET /usage - Get API usage statistics',
                'GET /dashboard - Authentication dashboard',
                'GET /docs - API documentation'
            ],
            authentication: {
                header: 'X-API-Key',
                format: 'Bearer {api_key}',
                rate_limits: {
                    free: '100 requests/hour',
                    premium: '1000 requests/hour',
                    enterprise: 'unlimited'
                }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Auth API error:', error);
        return res.status(500).json({
            error: 'Authentication failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Generate new API key
async function handleGenerateApiKey(req, res) {
    try {
        const { name, tier = 'free', email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: 'Name and email are required'
            });
        }

        // Generate secure API key
        const keyId = crypto.randomUUID();
        const apiKey = `ff_${crypto.randomBytes(32).toString('hex')}`;
        
        const keyData = {
            id: keyId,
            key: apiKey,
            name,
            email,
            tier,
            created: new Date().toISOString(),
            active: true,
            usage: {
                requests: 0,
                lastUsed: null
            },
            limits: getTierLimits(tier)
        };

        // Store API key
        apiKeys.set(keyId, keyData);
        
        console.log('API key generated:', {
            keyId,
            name,
            email,
            tier,
            timestamp: new Date().toISOString()
        });

        return res.status(201).json({
            success: true,
            message: 'API key generated successfully',
            data: {
                keyId,
                apiKey,
                name,
                tier,
                limits: keyData.limits,
                created: keyData.created
            }
        });

    } catch (error) {
        console.error('API key generation error:', error);
        return res.status(500).json({
            error: 'Failed to generate API key',
            message: error.message
        });
    }
}

// Validate API key
async function handleValidateApiKey(req, res) {
    try {
        const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

        if (!apiKey) {
            return res.status(401).json({
                error: 'API key required',
                message: 'Include X-API-Key header or Authorization: Bearer {key}'
            });
        }

        const keyData = findApiKeyData(apiKey);
        
        if (!keyData) {
            return res.status(401).json({
                error: 'Invalid API key',
                message: 'API key not found or inactive'
            });
        }

        // Check rate limits
        const rateLimitResult = checkRateLimit(keyData);
        if (!rateLimitResult.allowed) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: `Rate limit: ${keyData.limits.requests}/${keyData.limits.period}`,
                resetTime: rateLimitResult.resetTime
            });
        }

        // Update usage
        updateUsage(keyData);

        return res.status(200).json({
            valid: true,
            keyId: keyData.id,
            name: keyData.name,
            tier: keyData.tier,
            usage: keyData.usage,
            limits: keyData.limits,
            rateLimitRemaining: rateLimitResult.remaining
        });

    } catch (error) {
        console.error('API key validation error:', error);
        return res.status(500).json({
            error: 'Validation failed',
            message: error.message
        });
    }
}

// Revoke API key
async function handleRevokeApiKey(req, res) {
    try {
        const keyId = req.url.split('/').pop();
        const adminKey = req.headers['x-admin-key'];

        // Simple admin check (in production, use proper admin authentication)
        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({
                error: 'Admin access required'
            });
        }

        const keyData = apiKeys.get(keyId);
        if (!keyData) {
            return res.status(404).json({
                error: 'API key not found'
            });
        }

        // Deactivate key
        keyData.active = false;
        keyData.revokedAt = new Date().toISOString();

        console.log('API key revoked:', {
            keyId,
            name: keyData.name,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            message: 'API key revoked successfully',
            keyId,
            revokedAt: keyData.revokedAt
        });

    } catch (error) {
        console.error('API key revocation error:', error);
        return res.status(500).json({
            error: 'Failed to revoke API key',
            message: error.message
        });
    }
}

// Get API usage statistics
async function handleGetUsage(req, res) {
    try {
        const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

        if (!apiKey) {
            return res.status(401).json({
                error: 'API key required'
            });
        }

        const keyData = findApiKeyData(apiKey);
        
        if (!keyData) {
            return res.status(401).json({
                error: 'Invalid API key'
            });
        }

        const usage = apiUsage.get(keyData.id) || {
            daily: 0,
            monthly: 0,
            total: keyData.usage.requests
        };

        return res.status(200).json({
            success: true,
            keyId: keyData.id,
            name: keyData.name,
            tier: keyData.tier,
            usage: {
                ...keyData.usage,
                ...usage
            },
            limits: keyData.limits,
            created: keyData.created
        });

    } catch (error) {
        console.error('Usage retrieval error:', error);
        return res.status(500).json({
            error: 'Failed to get usage data',
            message: error.message
        });
    }
}

// Authentication dashboard
async function handleAuthDashboard(req, res) {
    try {
        const dashboardHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FlashFusion API Authentication Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .form-group {
            margin-bottom: 1rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        input, select {
            width: 100%;
            padding: 0.75rem;
            border: none;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 1rem;
        }
        input::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }
        .btn {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            margin: 0.5rem;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .api-key-display {
            background: rgba(0, 0, 0, 0.3);
            padding: 1rem;
            border-radius: 10px;
            font-family: monospace;
            word-break: break-all;
            margin: 1rem 0;
        }
        .tier-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .tier-card {
            background: rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            border-radius: 15px;
            text-align: center;
        }
        .tier-card h3 {
            color: #4ecdc4;
            margin-bottom: 1rem;
        }
        .endpoint-list {
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
        }
        .endpoint {
            margin: 0.5rem 0;
            font-family: monospace;
            font-size: 0.9rem;
        }
        .method {
            display: inline-block;
            padding: 0.2rem 0.5rem;
            border-radius: 5px;
            font-weight: bold;
            margin-right: 0.5rem;
            min-width: 60px;
            text-align: center;
        }
        .get { background: #27ae60; }
        .post { background: #3498db; }
        .delete { background: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 FlashFusion API Authentication</h1>
        
        <div class="card">
            <h2>Generate API Key</h2>
            <form id="keyForm">
                <div class="form-group">
                    <label for="name">Project Name:</label>
                    <input type="text" id="name" placeholder="My FlashFusion Project" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" placeholder="developer@company.com" required>
                </div>
                <div class="form-group">
                    <label for="tier">Tier:</label>
                    <select id="tier">
                        <option value="free">Free (100 req/hour)</option>
                        <option value="premium">Premium (1000 req/hour)</option>
                        <option value="enterprise">Enterprise (Unlimited)</option>
                    </select>
                </div>
                <button type="submit" class="btn">Generate API Key</button>
            </form>
            <div id="keyResult" style="display: none;">
                <h3>Your API Key:</h3>
                <div class="api-key-display" id="apiKeyDisplay"></div>
                <p><strong>⚠️ Save this key securely - it won't be shown again!</strong></p>
            </div>
        </div>

        <div class="card">
            <h2>API Tiers</h2>
            <div class="tier-info">
                <div class="tier-card">
                    <h3>Free Tier</h3>
                    <p>100 requests/hour</p>
                    <p>Basic webhooks</p>
                    <p>Community support</p>
                </div>
                <div class="tier-card">
                    <h3>Premium Tier</h3>
                    <p>1,000 requests/hour</p>
                    <p>Advanced webhooks</p>
                    <p>Priority support</p>
                </div>
                <div class="tier-card">
                    <h3>Enterprise Tier</h3>
                    <p>Unlimited requests</p>
                    <p>Custom integrations</p>
                    <p>Dedicated support</p>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>API Endpoints</h2>
            <div class="endpoint-list">
                <div class="endpoint">
                    <span class="method post">POST</span>
                    <span>/api/auth/generate-key</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span>/api/auth/validate-key</span>
                </div>
                <div class="endpoint">
                    <span class="method get">GET</span>
                    <span>/api/auth/usage</span>
                </div>
                <div class="endpoint">
                    <span class="method delete">DELETE</span>
                    <span>/api/auth/revoke-key/:keyId</span>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Usage Example</h2>
            <div class="endpoint-list">
                <pre><code>// Using your API key
fetch('/api/webhooks/zapier', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'ff_your_api_key_here'
  },
  body: JSON.stringify({
    action_type: 'create_lead',
    name: 'John Doe',
    email: 'john@example.com'
  })
});</code></pre>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('keyForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                tier: document.getElementById('tier').value
            };

            try {
                const response = await fetch('/api/auth/generate-key', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    document.getElementById('apiKeyDisplay').textContent = result.data.apiKey;
                    document.getElementById('keyResult').style.display = 'block';
                    document.getElementById('keyForm').reset();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Failed to generate API key: ' + error.message);
            }
        });
    </script>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(dashboardHtml);

    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).json({
            error: 'Failed to load dashboard',
            message: error.message
        });
    }
}

// API documentation
async function handleApiDocs(req, res) {
    try {
        const docs = {
            title: 'FlashFusion API Documentation',
            version: '2.0.0',
            baseUrl: 'https://flashfusion.co/api',
            authentication: {
                type: 'API Key',
                header: 'X-API-Key',
                format: 'ff_[64_character_hex_string]'
            },
            endpoints: {
                auth: {
                    'POST /auth/generate-key': {
                        description: 'Generate a new API key',
                        body: {
                            name: 'string (required)',
                            email: 'string (required)',
                            tier: 'string (optional: free|premium|enterprise)'
                        },
                        response: {
                            success: 'boolean',
                            data: {
                                keyId: 'string',
                                apiKey: 'string',
                                name: 'string',
                                tier: 'string',
                                limits: 'object'
                            }
                        }
                    },
                    'GET /auth/validate-key': {
                        description: 'Validate an API key',
                        headers: {
                            'X-API-Key': 'string (required)'
                        },
                        response: {
                            valid: 'boolean',
                            keyId: 'string',
                            usage: 'object',
                            limits: 'object'
                        }
                    }
                },
                webhooks: {
                    'POST /webhooks/zapier': {
                        description: 'Zapier webhook endpoint',
                        headers: {
                            'X-API-Key': 'string (required)',
                            'Content-Type': 'application/json'
                        },
                        body: {
                            action_type: 'string',
                            data: 'object'
                        }
                    }
                }
            },
            rateLimits: {
                free: '100 requests per hour',
                premium: '1000 requests per hour',
                enterprise: 'Unlimited'
            },
            examples: {
                generateKey: {
                    url: 'POST /api/auth/generate-key',
                    body: {
                        name: 'My Project',
                        email: 'dev@company.com',
                        tier: 'premium'
                    }
                },
                useWebhook: {
                    url: 'POST /api/webhooks/zapier',
                    headers: {
                        'X-API-Key': 'ff_your_api_key_here'
                    },
                    body: {
                        action_type: 'create_lead',
                        name: 'John Doe',
                        email: 'john@example.com'
                    }
                }
            }
        };

        return res.status(200).json(docs);

    } catch (error) {
        console.error('API docs error:', error);
        return res.status(500).json({
            error: 'Failed to load API documentation',
            message: error.message
        });
    }
}

// Helper functions
function getTierLimits(tier) {
    const limits = {
        free: { requests: 100, period: 'hour' },
        premium: { requests: 1000, period: 'hour' },
        enterprise: { requests: -1, period: 'unlimited' }
    };
    return limits[tier] || limits.free;
}

function findApiKeyData(apiKey) {
    for (const [keyId, keyData] of apiKeys) {
        if (keyData.key === apiKey && keyData.active) {
            return keyData;
        }
    }
    return null;
}

function checkRateLimit(keyData) {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const limit = keyData.limits.requests;
    
    if (limit === -1) {
        return { allowed: true, remaining: -1 };
    }

    const rateLimitKey = keyData.id;
    const currentWindow = Math.floor(now / windowMs);
    
    if (!rateLimits.has(rateLimitKey)) {
        rateLimits.set(rateLimitKey, { window: currentWindow, count: 0 });
    }
    
    const rateLimitData = rateLimits.get(rateLimitKey);
    
    if (rateLimitData.window !== currentWindow) {
        rateLimitData.window = currentWindow;
        rateLimitData.count = 0;
    }
    
    if (rateLimitData.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: (currentWindow + 1) * windowMs
        };
    }
    
    rateLimitData.count++;
    return {
        allowed: true,
        remaining: limit - rateLimitData.count
    };
}

function updateUsage(keyData) {
    keyData.usage.requests++;
    keyData.usage.lastUsed = new Date().toISOString();
    
    // Update daily/monthly usage tracking
    const usage = apiUsage.get(keyData.id) || { daily: 0, monthly: 0, total: 0 };
    usage.daily++;
    usage.monthly++;
    usage.total++;
    apiUsage.set(keyData.id, usage);
}