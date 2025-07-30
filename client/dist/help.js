// Help Center JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // FAQ toggle functionality
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            toggleFAQ(this);
        });
    });
}

function showHelpTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

function toggleFAQ(questionElement) {
    const answer = questionElement.nextElementSibling;
    const allAnswers = document.querySelectorAll('.faq-answer');
    
    // Close all other FAQ answers
    allAnswers.forEach(ans => {
        if (ans !== answer) {
            ans.classList.remove('active');
        }
    });
    
    // Toggle current answer
    answer.classList.toggle('active');
}

// Search functionality for help content
function searchHelp() {
    const searchTerm = document.getElementById('help-search').value.toLowerCase();
    const faqItems = document.querySelectorAll('.faq-item');
    const troubleItems = document.querySelectorAll('.trouble-item');
    
    // Search FAQ items
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
        
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = searchTerm ? 'none' : 'block';
        }
    });
    
    // Search troubleshooting items
    troubleItems.forEach(item => {
        const content = item.textContent.toLowerCase();
        
        if (content.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = searchTerm ? 'none' : 'block';
        }
    });
}

// Copy API endpoint to clipboard
function copyApiEndpoint(endpoint) {
    navigator.clipboard.writeText(endpoint).then(() => {
        showSuccess('API endpoint copied to clipboard!');
    }).catch(() => {
        showError('Failed to copy to clipboard');
    });
}

// Test API endpoint
async function testApiEndpoint(endpoint) {
    try {
        showSuccess(`Testing ${endpoint}...`);
        const response = await fetch(endpoint);
        
        if (response.ok) {
            showSuccess(`✅ ${endpoint} is working!`);
        } else {
            showError(`❌ ${endpoint} returned ${response.status}`);
        }
    } catch (error) {
        showError(`❌ Failed to test ${endpoint}: ${error.message}`);
    }
}

// Contact support
function contactSupport(type = 'general') {
    const supportTypes = {
        general: 'support@flashfusion.ai',
        bugs: 'bugs@flashfusion.ai',
        features: 'features@flashfusion.ai'
    };
    
    const email = supportTypes[type] || supportTypes.general;
    const subject = encodeURIComponent(`FlashFusion Support - ${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const body = encodeURIComponent(`
Hello FlashFusion Support Team,

I need assistance with:

Platform Version: 2.0.0
Issue Category: ${type}
Description: [Please describe your issue here]

System Information:
- Browser: ${navigator.userAgent}
- Platform: ${navigator.platform}
- Timestamp: ${new Date().toISOString()}

Thank you for your support!
    `.trim());
    
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
}

// Export system diagnostics
function exportDiagnostics() {
    const diagnostics = {
        timestamp: new Date().toISOString(),
        platform: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
        },
        location: {
            href: window.location.href,
            protocol: window.location.protocol,
            host: window.location.host
        },
        performance: {
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : 'Not available',
            timing: performance.timing ? {
                navigationStart: performance.timing.navigationStart,
                loadEventEnd: performance.timing.loadEventEnd,
                domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd
            } : 'Not available'
        },
        localStorage: {
            available: typeof(Storage) !== "undefined",
            itemCount: localStorage ? localStorage.length : 0
        }
    };
    
    const blob = new Blob([JSON.stringify(diagnostics, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashfusion_diagnostics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('System diagnostics exported successfully!');
}

// Run system health check
async function runHealthCheck() {
    showSuccess('Running system health check...');
    
    const checks = [
        { name: 'Platform Health', endpoint: '/health' },
        { name: 'API Status', endpoint: '/api/v1/status' },
        { name: 'Agent System', endpoint: '/api/v1/agents' },
        { name: 'Workflow Engine', endpoint: '/api/v1/workflows' }
    ];
    
    const results = [];
    
    for (const check of checks) {
        try {
            const startTime = performance.now();
            const response = await fetch(check.endpoint);
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            
            results.push({
                name: check.name,
                status: response.ok ? 'healthy' : 'error',
                responseTime: responseTime,
                statusCode: response.status
            });
        } catch (error) {
            results.push({
                name: check.name,
                status: 'failed',
                error: error.message,
                responseTime: 0,
                statusCode: 0
            });
        }
    }
    
    displayHealthCheckResults(results);
}

function displayHealthCheckResults(results) {
    const modalHtml = `
        <div class="modal" id="health-check-modal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="closeHealthCheckModal()">&times;</span>
                <h2>🏥 System Health Check Results</h2>
                <div class="health-results">
                    ${results.map(result => `
                        <div class="health-item ${result.status}">
                            <div class="health-header">
                                <span class="health-name">${result.name}</span>
                                <span class="health-status ${result.status}">
                                    ${result.status === 'healthy' ? '✅' : result.status === 'error' ? '⚠️' : '❌'}
                                    ${result.status.toUpperCase()}
                                </span>
                            </div>
                            <div class="health-details">
                                ${result.responseTime ? `<span>Response Time: ${result.responseTime}ms</span>` : ''}
                                ${result.statusCode ? `<span>Status Code: ${result.statusCode}</span>` : ''}
                                ${result.error ? `<span class="error">Error: ${result.error}</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="health-summary">
                    <h4>Summary</h4>
                    <p>
                        ✅ Healthy: ${results.filter(r => r.status === 'healthy').length} | 
                        ⚠️ Issues: ${results.filter(r => r.status === 'error').length} | 
                        ❌ Failed: ${results.filter(r => r.status === 'failed').length}
                    </p>
                    <div class="health-actions">
                        <button onclick="exportHealthResults()" class="btn-secondary">📤 Export Results</button>
                        <button onclick="contactSupport('bugs')" class="btn-secondary">🐛 Report Issues</button>
                        <button onclick="closeHealthCheckModal()" class="btn-primary">✅ Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('health-check-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Store results globally for export
    window.lastHealthResults = results;
}

function closeHealthCheckModal() {
    const modal = document.getElementById('health-check-modal');
    if (modal) {
        modal.remove();
    }
}

function exportHealthResults() {
    if (!window.lastHealthResults) {
        showError('No health check results to export');
        return;
    }
    
    const exportData = {
        timestamp: new Date().toISOString(),
        platform: 'FlashFusion Unified v2.0.0',
        results: window.lastHealthResults,
        summary: {
            total: window.lastHealthResults.length,
            healthy: window.lastHealthResults.filter(r => r.status === 'healthy').length,
            errors: window.lastHealthResults.filter(r => r.status === 'error').length,
            failed: window.lastHealthResults.filter(r => r.status === 'failed').length
        }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashfusion_health_check_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Health check results exported!');
}

// Utility functions
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: #ef4444; color: white; padding: 1rem; border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Add help-specific CSS
const style = document.createElement('style');
style.textContent = `
    .health-results {
        margin: 2rem 0;
    }
    .health-item {
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 6px;
        border-left: 4px solid #61dafb;
    }
    .health-item.healthy {
        background: rgba(74, 222, 128, 0.1);
        border-left-color: #4ade80;
    }
    .health-item.error {
        background: rgba(251, 191, 36, 0.1);
        border-left-color: #fbbf24;
    }
    .health-item.failed {
        background: rgba(239, 68, 68, 0.1);
        border-left-color: #ef4444;
    }
    .health-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .health-name {
        font-weight: bold;
    }
    .health-status.healthy { color: #4ade80; }
    .health-status.error { color: #fbbf24; }
    .health-status.failed { color: #ef4444; }
    .health-details {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        font-size: 0.9rem;
        opacity: 0.8;
    }
    .health-details .error {
        color: #ef4444;
        font-weight: bold;
    }
    .health-summary {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255,255,255,0.2);
    }
    .health-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    /* FAQ Animation */
    .faq-answer {
        transition: max-height 0.3s ease, padding 0.3s ease;
    }
    
    /* API Documentation Enhancements */
    .api-endpoint {
        position: relative;
    }
    .api-endpoint::after {
        content: "📋";
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s ease;
    }
    .api-endpoint:hover::after {
        opacity: 1;
    }
    
    /* Support Cards Enhancement */
    .support-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .support-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(97, 218, 251, 0.2);
    }
`;
document.head.appendChild(style);

// Add search functionality to help page
if (window.location.pathname.includes('help.html')) {
    const searchHtml = `
        <div class="help-search" style="margin-bottom: 2rem;">
            <input type="text" id="help-search" placeholder="Search help content..." 
                   style="width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white;"
                   onkeyup="searchHelp()">
        </div>
    `;
    
    document.addEventListener('DOMContentLoaded', function() {
        const main = document.querySelector('.main');
        if (main) {
            main.insertAdjacentHTML('afterbegin', searchHtml);
        }
    });
}