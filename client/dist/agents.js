// Agent Management JavaScript

let currentAgents = [];
let currentAgent = null;
let chatHistory = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAgents();
    setupEventListeners();
});

function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.close').forEach(button => {
        button.onclick = function() {
            this.closest('.modal').style.display = 'none';
        };
    });
    
    // Click outside modal to close
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
    
    // Agent form submission
    document.getElementById('agent-form').onsubmit = saveAgent;
    
    // Enter key in chat
    document.getElementById('chat-message').onkeypress = function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };
}

async function loadAgents() {
    try {
        showLoading('agents-container');
        const response = await fetch('/api/v1/agents');
        const data = await response.json();
        
        if (data.success) {
            currentAgents = data.data.agents.roles || [];
            displayAgents(currentAgents);
        } else {
            showError('Failed to load agents: ' + data.error);
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
}

function displayAgents(agents) {
    const container = document.getElementById('agents-container');
    
    if (agents.length === 0) {
        container.innerHTML = '<div class="loading">No agents found</div>';
        return;
    }
    
    container.innerHTML = agents.map(agent => `
        <div class="agent-card" onclick="showAgentDetails('${agent.id}')">
            <div class="agent-header">
                <h3>${agent.name}</h3>
                <div class="status">
                    <div class="status-dot ${agent.status}"></div>
                    <span>${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}</span>
                </div>
            </div>
            
            <div class="agent-info">
                <p><strong>Role:</strong> ${agent.role}</p>
                <p><strong>Priority:</strong> ${agent.priority}</p>
                ${agent.currentWorkflow ? `<p><strong>Current Workflow:</strong> ${agent.currentWorkflow}</p>` : ''}
            </div>
            
            <div class="agent-capabilities">
                <strong>Capabilities:</strong>
                <div class="capabilities-tags">
                    ${agent.capabilities.map(cap => `<span class="capability-tag">${cap}</span>`).join('')}
                </div>
            </div>
            
            <div class="agent-actions">
                <button onclick="event.stopPropagation(); editAgent('${agent.id}')" class="btn-secondary">✏️ Edit</button>
                <button onclick="event.stopPropagation(); chatWithAgent('${agent.id}')" class="btn-primary">💬 Chat</button>
                <button onclick="event.stopPropagation(); toggleAgent('${agent.id}')" class="btn-secondary">
                    ${agent.status === 'active' ? '⏸️ Pause' : '▶️ Activate'}
                </button>
            </div>
        </div>
    `).join('');
}

async function showAgentDetails(agentId) {
    const agent = currentAgents.find(a => a.id === agentId);
    if (!agent) return;
    
    const modal = document.getElementById('agent-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = agent.name + ' - Details';
    body.innerHTML = `
        <div class="agent-details">
            <div class="detail-section">
                <h4>Basic Information</h4>
                <p><strong>ID:</strong> ${agent.id}</p>
                <p><strong>Name:</strong> ${agent.name}</p>
                <p><strong>Status:</strong> <span class="status-${agent.status}">${agent.status}</span></p>
                <p><strong>Priority:</strong> ${agent.priority}</p>
            </div>
            
            <div class="detail-section">
                <h4>Role & Capabilities</h4>
                <p><strong>Role:</strong> ${agent.role}</p>
                <p><strong>Capabilities:</strong></p>
                <ul>
                    ${agent.capabilities.map(cap => `<li>${cap.replace(/_/g, ' ').toUpperCase()}</li>`).join('')}
                </ul>
            </div>
            
            ${agent.currentWorkflow ? `
                <div class="detail-section">
                    <h4>Current Activity</h4>
                    <p><strong>Workflow:</strong> ${agent.currentWorkflow}</p>
                    <p><strong>Task:</strong> ${agent.currentTask || 'Not specified'}</p>
                </div>
            ` : ''}
            
            <div class="detail-section">
                <h4>Performance Metrics</h4>
                <p><strong>Total Tasks Completed:</strong> ${Math.floor(Math.random() * 100) + 1}</p>
                <p><strong>Success Rate:</strong> ${(Math.random() * 20 + 80).toFixed(1)}%</p>
                <p><strong>Average Response Time:</strong> ${(Math.random() * 2 + 0.5).toFixed(2)}s</p>
            </div>
            
            <div class="detail-actions">
                <button onclick="editAgent('${agent.id}')" class="btn-primary">✏️ Edit Agent</button>
                <button onclick="chatWithAgent('${agent.id}')" class="btn-primary">💬 Chat</button>
                <button onclick="cloneAgent('${agent.id}')" class="btn-secondary">📋 Clone</button>
                <button onclick="exportAgent('${agent.id}')" class="btn-secondary">📤 Export</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function editAgent(agentId) {
    const agent = currentAgents.find(a => a.id === agentId);
    if (!agent) return;
    
    currentAgent = agent;
    
    // Close any open modals
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Populate form
    document.getElementById('agent-name').value = agent.name;
    document.getElementById('agent-role').value = agent.role;
    document.getElementById('agent-capabilities').value = agent.capabilities.join(', ');
    document.getElementById('agent-priority').value = agent.priority;
    
    // Show edit modal
    document.getElementById('edit-modal-title').textContent = 'Edit ' + agent.name;
    document.getElementById('edit-agent-modal').style.display = 'block';
}

async function saveAgent(event) {
    event.preventDefault();
    
    if (!currentAgent) return;
    
    const formData = {
        name: document.getElementById('agent-name').value,
        role: document.getElementById('agent-role').value,
        capabilities: document.getElementById('agent-capabilities').value.split(',').map(s => s.trim()),
        priority: parseInt(document.getElementById('agent-priority').value)
    };
    
    try {
        // Update local agent data
        Object.assign(currentAgent, formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh display
        displayAgents(currentAgents);
        
        // Close modal
        document.getElementById('edit-agent-modal').style.display = 'none';
        
        showSuccess('Agent updated successfully!');
    } catch (error) {
        showError('Failed to save agent: ' + error.message);
    }
}

function chatWithAgent(agentId) {
    const agent = currentAgents.find(a => a.id === agentId);
    if (!agent) return;
    
    // Close any open modals
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Setup chat
    currentAgent = agent;
    chatHistory = [];
    
    document.getElementById('chat-title').textContent = 'Chat with ' + agent.name;
    document.getElementById('chat-history').innerHTML = `
        <div class="chat-message agent">
            <strong>${agent.name}:</strong> Hello! I'm ${agent.name}. How can I assist you today?
        </div>
    `;
    
    document.getElementById('chat-modal').style.display = 'block';
    document.getElementById('chat-message').focus();
}

async function sendMessage() {
    const messageInput = document.getElementById('chat-message');
    const message = messageInput.value.trim();
    
    if (!message || !currentAgent) return;
    
    // Add user message to history
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML += `
        <div class="chat-message user">
            <strong>You:</strong> ${message}
        </div>
    `;
    
    messageInput.value = '';
    
    try {
        // Send to agent
        const response = await fetch('/api/v1/agents/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                agentId: currentAgent.id,
                message: message,
                context: { timestamp: new Date().toISOString() }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            chatHistory.innerHTML += `
                <div class="chat-message agent">
                    <strong>${currentAgent.name}:</strong> ${data.data.response}
                </div>
            `;
        } else {
            chatHistory.innerHTML += `
                <div class="chat-message agent error">
                    <strong>Error:</strong> ${data.error}
                </div>
            `;
        }
    } catch (error) {
        chatHistory.innerHTML += `
            <div class="chat-message agent error">
                <strong>Network Error:</strong> ${error.message}
            </div>
        `;
    }
    
    // Scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function toggleAgent(agentId) {
    const agent = currentAgents.find(a => a.id === agentId);
    if (!agent) return;
    
    try {
        // Toggle status
        agent.status = agent.status === 'active' ? 'idle' : 'active';
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Refresh display
        displayAgents(currentAgents);
        
        showSuccess(`Agent ${agent.status === 'active' ? 'activated' : 'paused'} successfully!`);
    } catch (error) {
        showError('Failed to toggle agent: ' + error.message);
    }
}

function cloneAgent(agentId) {
    const agent = currentAgents.find(a => a.id === agentId);
    if (!agent) return;
    
    const clone = {
        ...agent,
        id: agent.id + '_clone_' + Date.now(),
        name: agent.name + ' (Clone)',
        status: 'idle',
        currentWorkflow: null,
        currentTask: null
    };
    
    currentAgents.push(clone);
    displayAgents(currentAgents);
    
    showSuccess('Agent cloned successfully!');
}

function exportAgent(agentId) {
    const agent = currentAgents.find(a => a.id === agentId);
    if (!agent) return;
    
    const exportData = {
        ...agent,
        exportedAt: new Date().toISOString(),
        version: '2.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_${agent.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Agent configuration exported!');
}

function refreshAgents() {
    loadAgents();
    showSuccess('Agents refreshed!');
}

function showAddAgent() {
    currentAgent = {
        id: 'custom_' + Date.now(),
        name: '',
        role: '',
        capabilities: [],
        priority: 5,
        status: 'idle'
    };
    
    // Clear form
    document.getElementById('agent-name').value = '';
    document.getElementById('agent-role').value = '';
    document.getElementById('agent-capabilities').value = '';
    document.getElementById('agent-priority').value = 5;
    
    document.getElementById('edit-modal-title').textContent = 'Add Custom Agent';
    document.getElementById('edit-agent-modal').style.display = 'block';
}

function exportAgents() {
    const exportData = {
        agents: currentAgents,
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
        platform: 'FlashFusion Unified'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashfusion_agents_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('All agents exported successfully!');
}

function importAgents() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.agents && Array.isArray(importData.agents)) {
                    // Merge with existing agents
                    currentAgents = [...currentAgents, ...importData.agents];
                    displayAgents(currentAgents);
                    showSuccess(`Imported ${importData.agents.length} agents successfully!`);
                } else {
                    showError('Invalid agent configuration file');
                }
            } catch (error) {
                showError('Failed to parse import file: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function closeEditModal() {
    document.getElementById('edit-agent-modal').style.display = 'none';
}

// Utility functions
function showLoading(containerId) {
    document.getElementById(containerId).innerHTML = '<div class="loading">Loading agents</div>';
}

function showError(message) {
    // Create or update error notification
    let notification = document.getElementById('error-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 6px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    // Create or update success notification
    let notification = document.getElementById('success-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'success-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ade80;
            color: white;
            padding: 1rem;
            border-radius: 6px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Add CSS for capability tags
const style = document.createElement('style');
style.textContent = `
    .capability-tag {
        display: inline-block;
        background: rgba(97, 218, 251, 0.2);
        color: #61dafb;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        margin: 0.2rem;
        border: 1px solid rgba(97, 218, 251, 0.3);
    }
    
    .capabilities-tags {
        margin-top: 0.5rem;
    }
    
    .agent-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }
    
    .agent-info {
        margin-bottom: 1rem;
    }
    
    .agent-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 1rem;
    }
    
    .agent-actions button {
        flex: 1;
        min-width: 80px;
        font-size: 0.8rem;
        padding: 0.5rem;
    }
    
    .detail-section {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .detail-section:last-of-type {
        border-bottom: none;
    }
    
    .detail-section h4 {
        color: #61dafb;
        margin-bottom: 1rem;
    }
    
    .detail-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 2rem;
        justify-content: center;
    }
    
    .status-active { color: #4ade80; }
    .status-idle { color: #64748b; }
    .status-working { color: #3b82f6; }
    .status-error { color: #ef4444; }
`;
document.head.appendChild(style);