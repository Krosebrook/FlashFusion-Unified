// Workflow Management JavaScript

let currentWorkflows = [];
let workflowTemplates = [];
let hierarchyOrder = [];

document.addEventListener('DOMContentLoaded', function() {
    loadWorkflows();
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.close').forEach(button => {
        button.onclick = function() {
            this.closest('.modal').style.display = 'none';
        };
    });
    
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
    
    document.getElementById('workflow-form').onsubmit = createWorkflowFromForm;
}

function showTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
    
    if (tabName === 'hierarchy') {
        loadHierarchy();
    }
}

async function loadWorkflows() {
    try {
        const response = await fetch('/api/v1/workflows');
        const data = await response.json();
        
        if (data.success) {
            currentWorkflows = data.data.workflows || [];
            loadTemplates();
            displayWorkflows();
        }
    } catch (error) {
        showError('Failed to load workflows: ' + error.message);
    }
}

function loadTemplates() {
    workflowTemplates = [
        {
            id: 'development',
            name: 'Development Workflow',
            description: 'MVP development, testing, and deployment automation',
            steps: ['requirements_analysis', 'architecture_design', 'development', 'testing', 'deployment', 'monitoring'],
            estimatedDuration: '2-4 weeks',
            complexity: 'high',
            icon: '💻'
        },
        {
            id: 'commerce',
            name: 'Commerce Workflow', 
            description: 'Multi-platform e-commerce automation and optimization',
            steps: ['market_research', 'product_setup', 'listing_optimization', 'pricing_strategy', 'inventory_management', 'performance_tracking'],
            estimatedDuration: '1-2 weeks',
            complexity: 'medium',
            icon: '🛒'
        },
        {
            id: 'content',
            name: 'Content Workflow',
            description: 'Content creation and distribution automation',
            steps: ['content_strategy', 'content_creation', 'seo_optimization', 'multi_platform_publishing', 'engagement_tracking', 'performance_analysis'],
            estimatedDuration: '3-7 days',
            complexity: 'low',
            icon: '📝'
        },
        {
            id: 'hybrid',
            name: 'Hybrid Workflow',
            description: 'Cross-workflow orchestration and optimization',
            steps: ['workflow_analysis', 'integration_planning', 'cross_workflow_optimization', 'unified_reporting', 'continuous_improvement'],
            estimatedDuration: '1-3 weeks',
            complexity: 'high',
            icon: '🔄'
        }
    ];
    
    displayTemplates();
}

function displayTemplates() {
    const container = document.getElementById('templates-container');
    container.innerHTML = workflowTemplates.map(template => `
        <div class="workflow-card template" onclick="showTemplateDetails('${template.id}')">
            <div class="workflow-header">
                <h3>${template.icon} ${template.name}</h3>
                <span class="complexity-badge ${template.complexity}">${template.complexity}</span>
            </div>
            <p>${template.description}</p>
            <div class="workflow-stats">
                <span>⏱️ ${template.estimatedDuration}</span>
                <span>📋 ${template.steps.length} steps</span>
            </div>
            <div class="workflow-actions">
                <button onclick="event.stopPropagation(); createFromTemplate('${template.id}')" class="btn-primary">🚀 Create</button>
                <button onclick="event.stopPropagation(); previewTemplate('${template.id}')" class="btn-secondary">👁️ Preview</button>
            </div>
        </div>
    `).join('');
}

function displayWorkflows() {
    const activeWorkflows = currentWorkflows.filter(w => ['running', 'created'].includes(w.status));
    const completedWorkflows = currentWorkflows.filter(w => w.status === 'completed');
    
    document.getElementById('active-container').innerHTML = activeWorkflows.length ? 
        activeWorkflows.map(createWorkflowCard).join('') :
        '<div class="loading">No active workflows</div>';
    
    document.getElementById('completed-container').innerHTML = completedWorkflows.length ?
        completedWorkflows.map(createWorkflowCard).join('') :
        '<div class="loading">No completed workflows</div>';
}

function createWorkflowCard(workflow) {
    const template = workflowTemplates.find(t => t.id === workflow.type);
    return `
        <div class="workflow-card ${workflow.status}" onclick="showWorkflowDetails('${workflow.id}')">
            <div class="workflow-header">
                <h3>${template?.icon || '⚙️'} ${workflow.name}</h3>
                <span class="status-badge ${workflow.status}">${workflow.status}</span>
            </div>
            <p>Type: ${workflow.type}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${workflow.progress || 0}%"></div>
                <span class="progress-text">${workflow.progress || 0}%</span>
            </div>
            <div class="workflow-stats">
                <span>📅 ${new Date(workflow.createdAt).toLocaleDateString()}</span>
                <span>⏱️ ${workflow.totalSteps || template?.steps.length || 0} steps</span>
            </div>
            <div class="workflow-actions">
                ${workflow.status === 'created' ? 
                    `<button onclick="event.stopPropagation(); startWorkflow('${workflow.id}')" class="btn-primary">▶️ Start</button>` :
                    `<button onclick="event.stopPropagation(); viewWorkflowLogs('${workflow.id}')" class="btn-secondary">📋 Logs</button>`
                }
                <button onclick="event.stopPropagation(); editWorkflow('${workflow.id}')" class="btn-secondary">✏️ Edit</button>
            </div>
        </div>
    `;
}

async function createFromTemplate(templateId) {
    const template = workflowTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    try {
        const response = await fetch('/api/v1/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: templateId,
                config: { name: `${template.name} - ${new Date().toLocaleDateString()}` }
            })
        });
        
        const data = await response.json();
        if (data.success) {
            loadWorkflows();
            showSuccess(`${template.name} created successfully!`);
        } else {
            showError('Failed to create workflow: ' + data.error);
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
}

async function startWorkflow(workflowId) {
    try {
        const response = await fetch(`/api/v1/workflows/${workflowId}/start`, {
            method: 'POST'
        });
        
        const data = await response.json();
        if (data.success) {
            loadWorkflows();
            showSuccess('Workflow started successfully!');
        } else {
            showError('Failed to start workflow: ' + data.error);
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
}

function loadHierarchy() {
    hierarchyOrder = [...workflowTemplates];
    displayHierarchy();
}

function displayHierarchy() {
    const container = document.getElementById('hierarchy-list');
    container.innerHTML = hierarchyOrder.map((item, index) => `
        <div class="sortable-item" draggable="true" data-id="${item.id}">
            <div class="hierarchy-item">
                <span class="drag-handle">⋮⋮</span>
                <span class="priority-number">${index + 1}</span>
                <span class="workflow-icon">${item.icon}</span>
                <span class="workflow-name">${item.name}</span>
                <span class="complexity ${item.complexity}">${item.complexity}</span>
                <div class="hierarchy-actions">
                    <button onclick="moveUp(${index})" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button onclick="moveDown(${index})" ${index === hierarchyOrder.length - 1 ? 'disabled' : ''}>↓</button>
                </div>
            </div>
        </div>
    `).join('');
    
    setupSortable();
}

function setupSortable() {
    const items = document.querySelectorAll('.sortable-item');
    items.forEach(item => {
        item.ondragstart = handleDragStart;
        item.ondragover = handleDragOver;
        item.ondrop = handleDrop;
        item.ondragend = handleDragEnd;
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (this !== draggedElement) {
        const fromIndex = Array.from(this.parentNode.children).indexOf(draggedElement);
        const toIndex = Array.from(this.parentNode.children).indexOf(this);
        
        const item = hierarchyOrder.splice(fromIndex, 1)[0];
        hierarchyOrder.splice(toIndex, 0, item);
        
        displayHierarchy();
    }
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
}

function moveUp(index) {
    if (index > 0) {
        [hierarchyOrder[index], hierarchyOrder[index - 1]] = [hierarchyOrder[index - 1], hierarchyOrder[index]];
        displayHierarchy();
    }
}

function moveDown(index) {
    if (index < hierarchyOrder.length - 1) {
        [hierarchyOrder[index], hierarchyOrder[index + 1]] = [hierarchyOrder[index + 1], hierarchyOrder[index]];
        displayHierarchy();
    }
}

function saveHierarchy() {
    // Simulate saving hierarchy
    showSuccess('Workflow hierarchy saved successfully!');
}

function resetHierarchy() {
    loadHierarchy();
    showSuccess('Hierarchy reset to default order!');
}

function createWorkflow() {
    document.getElementById('create-workflow-modal').style.display = 'block';
}

async function createWorkflowFromForm(event) {
    event.preventDefault();
    
    const formData = {
        type: document.getElementById('workflow-type').value,
        config: {
            name: document.getElementById('workflow-name').value || undefined,
            description: document.getElementById('workflow-description').value || undefined,
            priority: document.getElementById('workflow-priority').value
        }
    };
    
    try {
        const response = await fetch('/api/v1/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (data.success) {
            loadWorkflows();
            document.getElementById('create-workflow-modal').style.display = 'none';
            showSuccess('Workflow created successfully!');
        } else {
            showError('Failed to create workflow: ' + data.error);
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
}

function refreshWorkflows() {
    loadWorkflows();
    showSuccess('Workflows refreshed!');
}

function exportWorkflows() {
    const exportData = {
        workflows: currentWorkflows,
        templates: workflowTemplates,
        hierarchy: hierarchyOrder,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashfusion_workflows_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importWorkflows() {
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
                if (importData.workflows) {
                    currentWorkflows = [...currentWorkflows, ...importData.workflows];
                    displayWorkflows();
                    showSuccess('Workflows imported successfully!');
                }
            } catch (error) {
                showError('Failed to import workflows: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function closeCreateModal() {
    document.getElementById('create-workflow-modal').style.display = 'none';
}

// Utility functions
function showError(message) {
    console.error(message);
    // Add notification system
}

function showSuccess(message) {
    console.log(message);
    // Add notification system
}

// Add workflow-specific CSS
const style = document.createElement('style');
style.textContent = `
    .complexity-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    .complexity-badge.low { background: #4ade80; color: white; }
    .complexity-badge.medium { background: #f59e0b; color: white; }
    .complexity-badge.high { background: #ef4444; color: white; }
    
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    .status-badge.created { background: #64748b; color: white; }
    .status-badge.running { background: #3b82f6; color: white; }
    .status-badge.completed { background: #4ade80; color: white; }
    
    .progress-bar {
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
        height: 20px;
        position: relative;
        margin: 1rem 0;
    }
    .progress-fill {
        background: #61dafb;
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
    }
    .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .hierarchy-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem;
    }
    .drag-handle {
        cursor: move;
        color: #666;
    }
    .priority-number {
        font-weight: bold;
        color: #61dafb;
        min-width: 20px;
    }
    .hierarchy-actions {
        margin-left: auto;
        display: flex;
        gap: 0.5rem;
    }
    .hierarchy-actions button {
        padding: 0.25rem 0.5rem;
        border: 1px solid rgba(255,255,255,0.3);
        background: rgba(255,255,255,0.1);
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }
    .hierarchy-actions button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);