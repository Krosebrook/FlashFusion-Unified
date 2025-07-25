// Integration Hub JavaScript

let allIntegrations = [];
let currentFilter = 'all';

const integrationData = [
    // AI Services
    { id: 'openai', name: 'OpenAI', category: 'ai', status: 'connected', description: 'GPT models and AI services', icon: '🤖', cost: '$0.002/1K tokens' },
    { id: 'anthropic', name: 'Anthropic Claude', category: 'ai', status: 'connected', description: 'Claude AI assistant', icon: '🧠', cost: '$0.008/1K tokens' },
    { id: 'gemini', name: 'Google Gemini', category: 'ai', status: 'available', description: 'Google\'s AI model', icon: '💎', cost: '$0.001/1K tokens' },
    
    // Productivity
    { id: 'notion', name: 'Notion', category: 'productivity', status: 'connected', description: 'All-in-one workspace for notes, docs, and databases', icon: '📝', cost: 'Free personal plan' },
    
    // Automation
    { id: 'zapier', name: 'Zapier', category: 'automation', status: 'connected', description: 'Connect FlashFusion with 5,000+ apps for powerful automation', icon: '⚡', cost: 'Free plan + usage' },
    
    // Commerce
    { id: 'shopify', name: 'Shopify', category: 'commerce', status: 'available', description: 'E-commerce platform', icon: '🛒', cost: 'Free' },
    { id: 'stripe', name: 'Stripe', category: 'commerce', status: 'available', description: 'Payment processing', icon: '💳', cost: '2.9% + $0.30' },
    { id: 'amazon', name: 'Amazon', category: 'commerce', status: 'available', description: 'Marketplace integration', icon: '📦', cost: 'Variable fees' },
    
    // Social Media
    { id: 'twitter', name: 'Twitter/X', category: 'social', status: 'available', description: 'Social media automation', icon: '🐦', cost: 'API access required' },
    { id: 'linkedin', name: 'LinkedIn', category: 'social', status: 'available', description: 'Professional networking', icon: '💼', cost: 'Premium required' },
    { id: 'instagram', name: 'Instagram', category: 'social', status: 'available', description: 'Visual content platform', icon: '📸', cost: 'Business account' },
    
    // Development
    { id: 'github', name: 'GitHub', category: 'dev', status: 'connected', description: 'Code repository management', icon: '🐙', cost: 'Free/Pro plans' },
    { id: 'vercel', name: 'Vercel', category: 'dev', status: 'connected', description: 'Deployment platform', icon: '▲', cost: 'Free tier available' },
    { id: 'supabase', name: 'Supabase', category: 'dev', status: 'connected', description: 'Backend as a service', icon: '🗄️', cost: 'Free tier + usage' },
    
    // Analytics
    { id: 'google-analytics', name: 'Google Analytics', category: 'analytics', status: 'available', description: 'Web analytics platform', icon: '📊', cost: 'Free' },
    { id: 'mixpanel', name: 'Mixpanel', category: 'analytics', status: 'available', description: 'Product analytics', icon: '📈', cost: 'Free tier + paid' },
    { id: 'sentry', name: 'Sentry', category: 'analytics', status: 'available', description: 'Error monitoring', icon: '🚨', cost: 'Free tier + paid' }
];

document.addEventListener('DOMContentLoaded', function() {
    allIntegrations = [...integrationData];
    displayIntegrations();
    updateStats();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.close').forEach(button => {
        button.onclick = function() {
            this.closest('.modal').style.display = 'none';
        };
    });
}

function showIntegrationTab(category) {
    currentFilter = category;
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (category === 'analytics') {
        document.getElementById('analytics-dashboard').style.display = 'block';
        document.getElementById('integrations-container').style.display = 'none';
        showAnalytics();
    } else {
        document.getElementById('analytics-dashboard').style.display = 'none';
        document.getElementById('integrations-container').style.display = 'grid';
        displayIntegrations();
    }
}

function displayIntegrations() {
    const filtered = currentFilter === 'all' ? 
        allIntegrations : 
        allIntegrations.filter(i => i.category === currentFilter);
    
    const container = document.getElementById('integrations-container');
    container.innerHTML = filtered.map(integration => `
        <div class="integration-card ${integration.status}" onclick="showIntegrationDetails('${integration.id}')">
            <div class="integration-header">
                <div class="integration-icon">${integration.icon}</div>
                <div class="integration-info">
                    <h3>${integration.name}</h3>
                    <div class="status">
                        <div class="status-dot ${integration.status}"></div>
                        <span>${integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}</span>
                    </div>
                </div>
            </div>
            
            <p>${integration.description}</p>
            
            <div class="integration-details">
                <div class="detail-item">
                    <strong>Category:</strong> ${integration.category.toUpperCase()}
                </div>
                <div class="detail-item">
                    <strong>Cost:</strong> ${integration.cost}
                </div>
            </div>
            
            <div class="integration-actions">
                ${integration.status === 'connected' ? 
                    `<button onclick="event.stopPropagation(); disconnectIntegration('${integration.id}')" class="btn-danger">🔌 Disconnect</button>
                     <button onclick="event.stopPropagation(); testIntegration('${integration.id}')" class="btn-secondary">🧪 Test</button>` :
                    `<button onclick="event.stopPropagation(); connectIntegration('${integration.id}')" class="btn-primary">🔗 Connect</button>`
                }
                <button onclick="event.stopPropagation(); configureIntegration('${integration.id}')" class="btn-secondary">⚙️ Configure</button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const connected = allIntegrations.filter(i => i.status === 'connected').length;
    const available = allIntegrations.filter(i => i.status === 'available').length;
    const failed = allIntegrations.filter(i => i.status === 'failed').length;
    
    document.getElementById('connected-count').textContent = connected;
    document.getElementById('available-count').textContent = available;
    document.getElementById('failed-count').textContent = failed;
}

async function connectIntegration(id) {
    const integration = allIntegrations.find(i => i.id === id);
    if (!integration) return;
    
    // Simulate connection process
    integration.status = 'connecting';
    displayIntegrations();
    
    setTimeout(() => {
        integration.status = Math.random() > 0.1 ? 'connected' : 'failed';
        displayIntegrations();
        updateStats();
        
        if (integration.status === 'connected') {
            showSuccess(`${integration.name} connected successfully!`);
        } else {
            showError(`Failed to connect ${integration.name}. Please check your configuration.`);
        }
    }, 2000);
}

async function disconnectIntegration(id) {
    const integration = allIntegrations.find(i => i.id === id);
    if (!integration) return;
    
    if (confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
        integration.status = 'available';
        displayIntegrations();
        updateStats();
        showSuccess(`${integration.name} disconnected successfully!`);
    }
}

async function testIntegration(id) {
    const integration = allIntegrations.find(i => i.id === id);
    if (!integration) return;
    
    showSuccess(`Testing ${integration.name}...`);
    
    // Simulate test
    setTimeout(() => {
        const success = Math.random() > 0.2;
        if (success) {
            showSuccess(`${integration.name} test passed! ✅`);
        } else {
            showError(`${integration.name} test failed! ❌`);
        }
    }, 1500);
}

function configureIntegration(id) {
    const integration = allIntegrations.find(i => i.id === id);
    if (!integration) return;
    
    showIntegrationDetails(id);
}

function showIntegrationDetails(id) {
    const integration = allIntegrations.find(i => i.id === id);
    if (!integration) return;
    
    const modal = document.getElementById('integration-modal');
    const title = document.getElementById('integration-modal-title');
    const body = document.getElementById('integration-modal-body');
    
    title.textContent = `${integration.icon} ${integration.name} - Configuration`;
    
    body.innerHTML = `
        <div class="integration-config">
            <div class="config-section">
                <h4>Connection Status</h4>
                <div class="status-indicator ${integration.status}">
                    <div class="status-dot ${integration.status}"></div>
                    <span>${integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}</span>
                </div>
            </div>
            
            <div class="config-section">
                <h4>Configuration</h4>
                <form class="integration-form">
                    <div class="form-group">
                        <label>API Key:</label>
                        <input type="password" placeholder="Enter your API key..." value="${integration.status === 'connected' ? '••••••••••••••••' : ''}">
                    </div>
                    <div class="form-group">
                        <label>Endpoint URL:</label>
                        <input type="url" placeholder="https://api.${integration.id}.com" value="https://api.${integration.id}.com">
                    </div>
                    <div class="form-group">
                        <label>Rate Limit (requests/minute):</label>
                        <input type="number" value="60" min="1" max="1000">
                    </div>
                    <div class="form-group">
                        <label>Enable Webhooks:</label>
                        <input type="checkbox" ${integration.status === 'connected' ? 'checked' : ''}>
                    </div>
                </form>
            </div>
            
            <div class="config-section">
                <h4>Usage Statistics</h4>
                <div class="usage-stats">
                    <div class="stat-item">
                        <strong>Requests Today:</strong> ${Math.floor(Math.random() * 1000)}
                    </div>
                    <div class="stat-item">
                        <strong>Success Rate:</strong> ${(Math.random() * 10 + 90).toFixed(1)}%
                    </div>
                    <div class="stat-item">
                        <strong>Avg Response Time:</strong> ${(Math.random() * 500 + 100).toFixed(0)}ms
                    </div>
                    <div class="stat-item">
                        <strong>Monthly Cost:</strong> $${(Math.random() * 100 + 10).toFixed(2)}
                    </div>
                </div>
            </div>
            
            <div class="config-section">
                <h4>Available Features</h4>
                <div class="features-list">
                    ${getIntegrationFeatures(integration).map(feature => 
                        `<div class="feature-item">
                            <input type="checkbox" checked>
                            <span>${feature}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
            
            <div class="config-actions">
                <button class="btn-primary" onclick="saveIntegrationConfig('${id}')">💾 Save Configuration</button>
                <button class="btn-secondary" onclick="testIntegration('${id}')">🧪 Test Connection</button>
                <button class="btn-secondary" onclick="viewIntegrationLogs('${id}')">📋 View Logs</button>
                ${integration.status === 'connected' ? 
                    `<button class="btn-danger" onclick="disconnectIntegration('${id}')">🔌 Disconnect</button>` :
                    `<button class="btn-primary" onclick="connectIntegration('${id}')">🔗 Connect</button>`
                }
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function getIntegrationFeatures(integration) {
    const features = {
        ai: ['Text Generation', 'Image Analysis', 'Language Translation', 'Content Moderation'],
        commerce: ['Product Management', 'Order Processing', 'Inventory Sync', 'Customer Data'],
        social: ['Post Scheduling', 'Engagement Tracking', 'Analytics', 'Content Creation'],
        dev: ['Repository Management', 'CI/CD Integration', 'Issue Tracking', 'Code Analysis'],
        analytics: ['Event Tracking', 'Custom Dashboards', 'Real-time Analytics', 'Report Generation']
    };
    
    return features[integration.category] || ['API Access', 'Data Sync', 'Webhook Support', 'Rate Limiting'];
}

function showAnalytics() {
    // Simulate analytics data display
    const analyticsContainer = document.getElementById('analytics-dashboard');
    analyticsContainer.style.display = 'block';
    
    // You would typically load real chart data here
    // For now, we'll just show the placeholder charts
}

function filterIntegrations() {
    const searchTerm = document.getElementById('integration-search').value.toLowerCase();
    const filtered = allIntegrations.filter(i => 
        i.name.toLowerCase().includes(searchTerm) || 
        i.description.toLowerCase().includes(searchTerm) ||
        i.category.toLowerCase().includes(searchTerm)
    );
    
    const container = document.getElementById('integrations-container');
    container.innerHTML = filtered.map(integration => `
        <div class="integration-card ${integration.status}" onclick="showIntegrationDetails('${integration.id}')">
            <!-- Same card HTML as above -->
        </div>
    `).join('');
}

function clearSearch() {
    document.getElementById('integration-search').value = '';
    displayIntegrations();
}

function refreshIntegrations() {
    displayIntegrations();
    updateStats();
    showSuccess('Integrations refreshed!');
}

function testAllConnections() {
    const connected = allIntegrations.filter(i => i.status === 'connected');
    showSuccess(`Testing ${connected.length} connected integrations...`);
    
    connected.forEach((integration, index) => {
        setTimeout(() => {
            testIntegration(integration.id);
        }, index * 500);
    });
}

function saveIntegrationConfig(id) {
    showSuccess('Configuration saved successfully!');
    document.getElementById('integration-modal').style.display = 'none';
}

function viewIntegrationLogs(id) {
    const integration = allIntegrations.find(i => i.id === id);
    showSuccess(`Opening logs for ${integration.name}...`);
}

// Notion-specific integration functions
async function testNotionConnection() {
    try {
        const response = await fetch('/api/notion/test-connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        
        if (result.success) {
            showSuccess(`Notion connected successfully! User: ${result.user.name}`);
            updateNotionStatus('connected');
        } else {
            showError(`Notion connection failed: ${result.error}`);
            updateNotionStatus('error');
        }
    } catch (error) {
        showError(`Failed to test Notion connection: ${error.message}`);
        updateNotionStatus('error');
    }
}

async function getNotionDatabases() {
    try {
        const response = await fetch('/api/notion/databases');
        const result = await response.json();
        
        if (result.success) {
            showSuccess(`Found ${result.data.length} Notion databases`);
            displayNotionDatabases(result.data);
        } else {
            showError(`Failed to get databases: ${result.error}`);
        }
    } catch (error) {
        showError(`Failed to fetch Notion databases: ${error.message}`);
    }
}

function updateNotionStatus(status) {
    const notionIntegration = allIntegrations.find(i => i.id === 'notion');
    if (notionIntegration) {
        notionIntegration.status = status;
        displayIntegrations(); // Refresh the display
        updateStats();
    }
}

function displayNotionDatabases(databases) {
    // This would show databases in a modal or dedicated section
    console.log('Available Notion databases:', databases);
}

// Zapier-specific integration functions
async function openZapierAutomationHub() {
    window.open('/zapier-automation.html', '_blank');
}

async function testZapierWebhook() {
    try {
        const response = await fetch('/api/zapier/incoming-webhook');
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Zapier webhook endpoint is active and responding!');
            updateZapierStatus('connected');
        } else {
            showError('Zapier webhook test failed');
            updateZapierStatus('error');
        }
    } catch (error) {
        showError(`Failed to test Zapier webhook: ${error.message}`);
        updateZapierStatus('error');
    }
}

async function getZapierStats() {
    try {
        const response = await fetch('/api/zapier/webhooks/stats');
        const result = await response.json();
        
        if (result.success) {
            showSuccess(`Zapier stats: ${result.data.active} active webhooks, ${result.data.totalTriggers} total triggers`);
            displayZapierStats(result.data);
        } else {
            showError(`Failed to get Zapier stats: ${result.error}`);
        }
    } catch (error) {
        showError(`Failed to fetch Zapier stats: ${error.message}`);
    }
}

function updateZapierStatus(status) {
    const zapierIntegration = allIntegrations.find(i => i.id === 'zapier');
    if (zapierIntegration) {
        zapierIntegration.status = status;
        displayIntegrations(); // Refresh the display
        updateStats();
    }
}

function displayZapierStats(stats) {
    console.log('Zapier statistics:', stats);
    // Could show in a modal or update the integration card
}

// Utility functions
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: #ef4444; color: white; padding: 1rem; border-radius: 6px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: #4ade80; color: white; padding: 1rem; border-radius: 6px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Add integration-specific CSS
const style = document.createElement('style');
style.textContent = `
    .integration-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    .integration-icon {
        font-size: 2rem;
    }
    .integration-info h3 {
        margin: 0;
        color: #61dafb;
    }
    .integration-details {
        margin: 1rem 0;
    }
    .detail-item {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    .integration-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 1rem;
    }
    .integration-actions button {
        flex: 1;
        font-size: 0.8rem;
        padding: 0.5rem;
    }
    .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        border-radius: 6px;
        background: rgba(255,255,255,0.1);
    }
    .config-section {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .config-section h4 {
        color: #61dafb;
        margin-bottom: 1rem;
    }
    .usage-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    .stat-item {
        padding: 0.5rem;
        background: rgba(255,255,255,0.05);
        border-radius: 4px;
    }
    .features-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
    }
    .feature-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .config-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 2rem;
    }
`;
document.head.appendChild(style);