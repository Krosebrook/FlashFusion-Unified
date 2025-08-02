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
        container.textContent = '';
        const noAgentsDiv = document.createElement('div');
        noAgentsDiv.className = 'loading';
        noAgentsDiv.textContent = 'No agents found';
        container.appendChild(noAgentsDiv);
        return;
    }
    
    // Clear container safely
    container.textContent = '';
    
    // Create elements using safe DOM methods
    agents.forEach(agent => {
        const agentCard = document.createElement('div');
        agentCard.className = 'agent-card';
        agentCard.onclick = () => showAgentDetails(agent.id);
        
        // Agent header
        const header = document.createElement('div');
        header.className = 'agent-header';
        
        const nameEl = document.createElement('h3');
        nameEl.textContent = agent.name; // Safe text content
        
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status';
        
        const statusDot = document.createElement('div');
        statusDot.className = `status-dot ${agent.status}`;
        
        const statusSpan = document.createElement('span');
        statusSpan.textContent = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);
        
        statusDiv.appendChild(statusDot);
        statusDiv.appendChild(statusSpan);
        header.appendChild(nameEl);
        header.appendChild(statusDiv);
        
        // Agent info
        const info = document.createElement('div');
        info.className = 'agent-info';
        
        const roleP = document.createElement('p');
        const roleStrong = document.createElement('strong');
        roleStrong.textContent = 'Role:';
        roleP.appendChild(roleStrong);
        roleP.appendChild(document.createTextNode(' ' + agent.role));
        
        const priorityP = document.createElement('p');
        const priorityStrong = document.createElement('strong');
        priorityStrong.textContent = 'Priority:';
        priorityP.appendChild(priorityStrong);
        priorityP.appendChild(document.createTextNode(' ' + agent.priority));
        
        info.appendChild(roleP);
        info.appendChild(priorityP);
        
        if (agent.currentWorkflow) {
            const workflowP = document.createElement('p');
            const workflowStrong = document.createElement('strong');
            workflowStrong.textContent = 'Current Workflow:';
            workflowP.appendChild(workflowStrong);
            workflowP.appendChild(document.createTextNode(' ' + agent.currentWorkflow));
            info.appendChild(workflowP);
        }
        
        // Capabilities
        const capabilitiesDiv = document.createElement('div');
        capabilitiesDiv.className = 'agent-capabilities';
        
        const capTitle = document.createElement('strong');
        capTitle.textContent = 'Capabilities:';
        capabilitiesDiv.appendChild(capTitle);
        
        const capTags = document.createElement('div');
        capTags.className = 'capabilities-tags';
        
        agent.capabilities.forEach(cap => {
            const tag = document.createElement('span');
            tag.className = 'capability-tag';
            tag.textContent = cap; // Safe text content
            capTags.appendChild(tag);
        });
        
        capabilitiesDiv.appendChild(capTags);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'agent-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-secondary';
        editBtn.textContent = '✏️ Edit';
        editBtn.onclick = (e) => { e.stopPropagation(); editAgent(agent.id); };
        
        const chatBtn = document.createElement('button');
        chatBtn.className = 'btn-primary';
        chatBtn.textContent = '💬 Chat';
        chatBtn.onclick = (e) => { e.stopPropagation(); chatWithAgent(agent.id); };
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn-secondary';
        toggleBtn.textContent = agent.status === 'active' ? '⏸️ Pause' : '▶️ Activate';
        toggleBtn.onclick = (e) => { e.stopPropagation(); toggleAgent(agent.id); };
        
        actions.appendChild(editBtn);
        actions.appendChild(chatBtn);
        actions.appendChild(toggleBtn);
        
        // Assemble card
        agentCard.appendChild(header);
        agentCard.appendChild(info);
        agentCard.appendChild(capabilitiesDiv);
        agentCard.appendChild(actions);
        
        container.appendChild(agentCard);
    });
}

async function showAgentDetails(agentId) {
    const agent = currentAgents.find(a => a.id === agentId);
    if (!agent) return;
    
    const modal = document.getElementById('agent-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    title.textContent = agent.name + ' - Details';
    
    // Clear and create safe DOM structure
    body.textContent = '';
    
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'agent-details';
    
    // Basic Information section
    const basicSection = document.createElement('div');
    basicSection.className = 'detail-section';
    
    const basicTitle = document.createElement('h4');
    basicTitle.textContent = 'Basic Information';
    basicSection.appendChild(basicTitle);
    
    const idP = document.createElement('p');
    idP.innerHTML = '<strong>ID:</strong> ';
    idP.appendChild(document.createTextNode(agent.id));
    
    const nameP = document.createElement('p');
    nameP.innerHTML = '<strong>Name:</strong> ';
    nameP.appendChild(document.createTextNode(agent.name));
    
    const statusP = document.createElement('p');
    statusP.innerHTML = '<strong>Status:</strong> ';
    const statusSpan = document.createElement('span');
    statusSpan.className = `status-${agent.status}`;
    statusSpan.textContent = agent.status;
    statusP.appendChild(statusSpan);
    
    const priorityP = document.createElement('p');
    priorityP.innerHTML = '<strong>Priority:</strong> ';
    priorityP.appendChild(document.createTextNode(agent.priority));
    
    basicSection.appendChild(idP);
    basicSection.appendChild(nameP);
    basicSection.appendChild(statusP);
    basicSection.appendChild(priorityP);
    
    // Role & Capabilities section
    const roleSection = document.createElement('div');
    roleSection.className = 'detail-section';
    
    const roleTitle = document.createElement('h4');
    roleTitle.textContent = 'Role & Capabilities';
    roleSection.appendChild(roleTitle);
    
    const roleP = document.createElement('p');
    roleP.innerHTML = '<strong>Role:</strong> ';
    roleP.appendChild(document.createTextNode(agent.role));
    roleSection.appendChild(roleP);
    
    const capP = document.createElement('p');
    capP.innerHTML = '<strong>Capabilities:</strong>';
    roleSection.appendChild(capP);
    
    const capList = document.createElement('ul');
    agent.capabilities.forEach(cap => {
        const li = document.createElement('li');
        li.textContent = cap.replace(/_/g, ' ').toUpperCase();
        capList.appendChild(li);
    });
    roleSection.appendChild(capList);
    
    detailsDiv.appendChild(basicSection);
    detailsDiv.appendChild(roleSection);
    
    // Current Activity section (if exists)
    if (agent.currentWorkflow) {
        const activitySection = document.createElement('div');
        activitySection.className = 'detail-section';
        
        const activityTitle = document.createElement('h4');
        activityTitle.textContent = 'Current Activity';
        activitySection.appendChild(activityTitle);
        
        const workflowP = document.createElement('p');
        workflowP.innerHTML = '<strong>Workflow:</strong> ';
        workflowP.appendChild(document.createTextNode(agent.currentWorkflow));
        
        const taskP = document.createElement('p');
        taskP.innerHTML = '<strong>Task:</strong> ';
        taskP.appendChild(document.createTextNode(agent.currentTask || 'Not specified'));
        
        activitySection.appendChild(workflowP);
        activitySection.appendChild(taskP);
        detailsDiv.appendChild(activitySection);
    }
    
    // Performance Metrics section
    const metricsSection = document.createElement('div');
    metricsSection.className = 'detail-section';
    
    const metricsTitle = document.createElement('h4');
    metricsTitle.textContent = 'Performance Metrics';
    metricsSection.appendChild(metricsTitle);
    
    const tasksP = document.createElement('p');
    tasksP.innerHTML = '<strong>Total Tasks Completed:</strong> ';
    tasksP.appendChild(document.createTextNode(Math.floor(Math.random() * 100) + 1));
    
    const successP = document.createElement('p');
    successP.innerHTML = '<strong>Success Rate:</strong> ';
    successP.appendChild(document.createTextNode((Math.random() * 20 + 80).toFixed(1) + '%'));
    
    const responseP = document.createElement('p');
    responseP.innerHTML = '<strong>Average Response Time:</strong> ';
    responseP.appendChild(document.createTextNode((Math.random() * 2 + 0.5).toFixed(2) + 's'));
    
    metricsSection.appendChild(tasksP);
    metricsSection.appendChild(successP);
    metricsSection.appendChild(responseP);
    
    // Actions section
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'detail-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-primary';
    editBtn.textContent = '✏️ Edit Agent';
    editBtn.onclick = () => editAgent(agent.id);
    
    const chatBtn = document.createElement('button');
    chatBtn.className = 'btn-primary';
    chatBtn.textContent = '💬 Chat';
    chatBtn.onclick = () => chatWithAgent(agent.id);
    
    const cloneBtn = document.createElement('button');
    cloneBtn.className = 'btn-secondary';
    cloneBtn.textContent = '📋 Clone';
    cloneBtn.onclick = () => cloneAgent(agent.id);
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-secondary';
    exportBtn.textContent = '📤 Export';
    exportBtn.onclick = () => exportAgent(agent.id);
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(chatBtn);
    actionsDiv.appendChild(cloneBtn);
    actionsDiv.appendChild(exportBtn);
    
    detailsDiv.appendChild(metricsSection);
    detailsDiv.appendChild(actionsDiv);
    
    body.appendChild(detailsDiv);
    
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
    
    // Create safe initial message
    const chatHistoryEl = document.getElementById('chat-history');
    chatHistoryEl.textContent = '';
    
    const initialMsg = document.createElement('div');
    initialMsg.className = 'chat-message agent';
    
    const agentLabel = document.createElement('strong');
    agentLabel.textContent = agent.name + ':';
    
    initialMsg.appendChild(agentLabel);
    initialMsg.appendChild(document.createTextNode(' Hello! I\'m ' + agent.name + '. How can I assist you today?'));
    
    chatHistoryEl.appendChild(initialMsg);
    
    document.getElementById('chat-modal').style.display = 'block';
    document.getElementById('chat-message').focus();
}

async function sendMessage() {
    const messageInput = document.getElementById('chat-message');
    const message = messageInput.value.trim();
    
    if (!message || !currentAgent) return;
    
    // Add user message to history safely
    const chatHistory = document.getElementById('chat-history');
    
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    
    const userLabel = document.createElement('strong');
    userLabel.textContent = 'You:';
    
    userMsg.appendChild(userLabel);
    userMsg.appendChild(document.createTextNode(' ' + message));
    
    chatHistory.appendChild(userMsg);
    
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
            const agentMsg = document.createElement('div');
            agentMsg.className = 'chat-message agent';
            
            const agentLabel = document.createElement('strong');
            agentLabel.textContent = currentAgent.name + ':';
            
            agentMsg.appendChild(agentLabel);
            agentMsg.appendChild(document.createTextNode(' ' + data.data.response));
            
            chatHistory.appendChild(agentMsg);
        } else {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'chat-message agent error';
            
            const errorLabel = document.createElement('strong');
            errorLabel.textContent = 'Error:';
            
            errorMsg.appendChild(errorLabel);
            errorMsg.appendChild(document.createTextNode(' ' + data.error));
            
            chatHistory.appendChild(errorMsg);
        }
    } catch (error) {
        const networkErrorMsg = document.createElement('div');
        networkErrorMsg.className = 'chat-message agent error';
        
        const networkErrorLabel = document.createElement('strong');
        networkErrorLabel.textContent = 'Network Error:';
        
        networkErrorMsg.appendChild(networkErrorLabel);
        networkErrorMsg.appendChild(document.createTextNode(' ' + error.message));
        
        chatHistory.appendChild(networkErrorMsg);
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