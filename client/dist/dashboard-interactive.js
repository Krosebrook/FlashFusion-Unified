// FlashFusion Dashboard Interactive Features

// Global state management
window.FlashFusion = {
    state: {
        currentTab: 'snippets',
        currentLanguage: 'javascript',
        terminalHistory: [],
        aiChatHistory: [],
        codeHistory: []
    },
    
    // Terminal commands
    terminalCommands: {
        help: () => `Available commands:
  help - Show this help message
  status - Show system status
  agents - List all agents
  workflows - List all workflows
  clear - Clear terminal
  health - Run health check
  version - Show version info
  api [endpoint] - Test API endpoint
  run [code] - Execute JavaScript code
  export - Export system data
  restart - Restart services`,
        
        status: async () => {
            try {
                const response = await fetch('/api/v1/status');
                const data = await response.json();
                return JSON.stringify(data, null, 2);
            } catch (error) {
                return `Error: ${error.message}`;
            }
        },
        
        agents: async () => {
            try {
                const response = await fetch('/api/v1/agents');
                const data = await response.json();
                if (data.success) {
                    return data.data.agents.roles.map(agent => 
                        `${agent.name}: ${agent.status}`
                    ).join('\n');
                }
                return 'No agents found';
            } catch (error) {
                return `Error: ${error.message}`;
            }
        },
        
        workflows: async () => {
            try {
                const response = await fetch('/api/v1/workflows');
                const data = await response.json();
                if (data.success) {
                    return data.data.workflows.map(workflow => 
                        `${workflow.name}: ${workflow.status} (${workflow.progress || 0}%)`
                    ).join('\n');
                }
                return 'No workflows found';
            } catch (error) {
                return `Error: ${error.message}`;
            }
        },
        
        health: async () => {
            try {
                const response = await fetch('/health');
                const data = await response.json();
                return `System Health: ${data.status}
Uptime: ${Math.floor(data.uptime / 60)} minutes
Version: ${data.version}
Components: ${Object.keys(data.services || {}).join(', ')}`;
            } catch (error) {
                return `Health check failed: ${error.message}`;
            }
        },
        
        version: () => 'FlashFusion Unified v2.0.0 - AI Business Operating System',
        
        clear: () => {
            document.getElementById('terminal-content').innerHTML = '';
            return '';
        },
        
        api: async (endpoint) => {
            if (!endpoint) return 'Usage: api <endpoint>';
            try {
                const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
                const response = await fetch(url);
                return `Status: ${response.status}
Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}
Data: ${await response.text()}`;
            } catch (error) {
                return `API call failed: ${error.message}`;
            }
        },
        
        run: async (code) => {
            if (!code) return 'Usage: run <javascript code>';
            try {
                const result = eval(code);
                return typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
            } catch (error) {
                return `Execution error: ${error.message}`;
            }
        },
        
        export: () => {
            exportData();
            return 'Data export initiated...';
        },
        
        restart: () => 'Service restart not available in demo mode'
    }
};

// Editor Tab Functions
function showEditorTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.editor-tabs .tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.code-editor-container .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
    
    window.FlashFusion.state.currentTab = tabName;
    
    // Initialize tab-specific content
    if (tabName === 'snippets') {
        displayCodeSnippets();
    } else if (tabName === 'terminal') {
        document.getElementById('terminal-command').focus();
    } else if (tabName === 'ai-assist') {
        loadAIChat();
    }
}

// Code Snippets Functions
function displayCodeSnippets() {
    const container = document.getElementById('snippets-container');
    const category = document.getElementById('snippet-category').value;
    
    let snippetsToShow = [];
    if (category === 'all') {
        Object.values(codeSnippets).forEach(categorySnippets => {
            snippetsToShow.push(...categorySnippets);
        });
    } else {
        snippetsToShow = codeSnippets[category] || [];
    }
    
    container.innerHTML = snippetsToShow.map((snippet, index) => `
        <div class="snippet-card" onclick="loadSnippet(${index}, '${category}')">
            <h4>${snippet.title}</h4>
            <p>${snippet.description}</p>
            <div class="snippet-preview">
                <code>${snippet.code.substring(0, 100)}...</code>
            </div>
            <div class="snippet-actions">
                <button onclick="event.stopPropagation(); copySnippet(${index}, '${category}')" class="btn-secondary">📋 Copy</button>
                <button onclick="event.stopPropagation(); editSnippet(${index}, '${category}')" class="btn-primary">✏️ Edit</button>
            </div>
        </div>
    `).join('');
}

function filterSnippets() {
    displayCodeSnippets();
}

function loadSnippet(index, category) {
    const snippetsArray = category === 'all' ? 
        Object.values(codeSnippets).flat() : 
        codeSnippets[category];
    
    const snippet = snippetsArray[index];
    if (snippet) {
        document.getElementById('code-editor').value = snippet.code;
        showEditorTab('editor');
    }
}

function copySnippet(index, category) {
    const snippetsArray = category === 'all' ? 
        Object.values(codeSnippets).flat() : 
        codeSnippets[category];
    
    const snippet = snippetsArray[index];
    if (snippet) {
        navigator.clipboard.writeText(snippet.code).then(() => {
            showSuccess('Code snippet copied to clipboard!');
        });
    }
}

function editSnippet(index, category) {
    loadSnippet(index, category);
}

function createCustomSnippet() {
    const title = prompt('Enter snippet title:');
    const description = prompt('Enter snippet description:');
    
    if (title && description) {
        const newSnippet = {
            title: title,
            description: description,
            code: '// Your custom code here\n'
        };
        
        // Add to agents category by default
        if (!codeSnippets.custom) {
            codeSnippets.custom = [];
        }
        codeSnippets.custom.push(newSnippet);
        
        // Add to category dropdown if not exists
        const categorySelect = document.getElementById('snippet-category');
        let customOption = Array.from(categorySelect.options).find(opt => opt.value === 'custom');
        if (!customOption) {
            const option = document.createElement('option');
            option.value = 'custom';
            option.textContent = 'Custom';
            categorySelect.appendChild(option);
        }
        
        showSuccess('Custom snippet created! Select "Custom" category to see it.');
    }
}

// Code Editor Functions
function changeLanguage() {
    const language = document.getElementById('language-select').value;
    window.FlashFusion.state.currentLanguage = language;
    
    // Update editor placeholder based on language
    const placeholders = {
        javascript: '// JavaScript code here\nconsole.log("Hello FlashFusion!");',
        python: '# Python code here\nprint("Hello FlashFusion!")',
        bash: '#!/bin/bash\n# Bash script here\necho "Hello FlashFusion!"',
        json: '{\n  "message": "Hello FlashFusion!",\n  "timestamp": "' + new Date().toISOString() + '"\n}',
        yaml: '# YAML configuration\nmessage: Hello FlashFusion!\ntimestamp: ' + new Date().toISOString()
    };
    
    const editor = document.getElementById('code-editor');
    if (!editor.value.trim()) {
        editor.placeholder = placeholders[language] || placeholders.javascript;
    }
}

async function runCode() {
    const code = document.getElementById('code-editor').value;
    const language = window.FlashFusion.state.currentLanguage;
    const output = document.getElementById('code-output');
    
    if (!code.trim()) {
        output.innerHTML = '<div class="error">No code to execute</div>';
        return;
    }
    
    output.innerHTML = '<div class="loading">Executing code...</div>';
    
    try {
        let result;
        
        switch (language) {
            case 'javascript':
                // Execute JavaScript in a safe context
                result = await executeJavaScript(code);
                break;
            case 'python':
                result = 'Python execution not available in browser environment';
                break;
            case 'bash':
                result = 'Bash execution not available in browser environment';
                break;
            case 'json':
                try {
                    JSON.parse(code);
                    result = 'Valid JSON ✅';
                } catch (e) {
                    result = 'Invalid JSON: ' + e.message;
                }
                break;
            case 'yaml':
                result = 'YAML validation not implemented';
                break;
            default:
                result = 'Language not supported';
        }
        
        output.innerHTML = `
            <div class="output-header">
                <strong>Output (${language}):</strong>
                <span class="execution-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <pre class="output-content">${result}</pre>
        `;
        
    } catch (error) {
        output.innerHTML = `
            <div class="error">
                <strong>Execution Error:</strong>
                <pre>${error.message}</pre>
            </div>
        `;
    }
}

async function executeJavaScript(code) {
    // Create a safe execution context
    const context = {
        console: {
            log: (...args) => args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ')
        },
        fetch: fetch,
        FlashFusion: window.FlashFusion,
        setTimeout: setTimeout,
        setInterval: setInterval
    };
    
    try {
        // Create function with context
        const func = new Function(...Object.keys(context), code);
        const result = await func(...Object.values(context));
        
        return typeof result === 'undefined' ? 'Code executed successfully' : 
               typeof result === 'object' ? JSON.stringify(result, null, 2) : 
               String(result);
    } catch (error) {
        throw error;
    }
}

function saveCode() {
    const code = document.getElementById('code-editor').value;
    const language = window.FlashFusion.state.currentLanguage;
    
    if (!code.trim()) {
        showError('No code to save');
        return;
    }
    
    const filename = prompt('Enter filename:', `script.${language === 'javascript' ? 'js' : language}`);
    if (filename) {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        showSuccess('Code saved successfully!');
    }
}

function shareCode() {
    const code = document.getElementById('code-editor').value;
    if (!code.trim()) {
        showError('No code to share');
        return;
    }
    
    // Create shareable link (in a real implementation, this would use a service)
    const encodedCode = encodeURIComponent(code);
    const shareableLink = `${window.location.origin}${window.location.pathname}?code=${encodedCode}`;
    
    navigator.clipboard.writeText(shareableLink).then(() => {
        showSuccess('Shareable link copied to clipboard!');
    }).catch(() => {
        // Fallback: show link in modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                <h3>Share Code</h3>
                <p>Copy this link to share your code:</p>
                <textarea readonly style="width: 100%; height: 100px;">${shareableLink}</textarea>
                <button onclick="navigator.clipboard.writeText('${shareableLink}'); showSuccess('Link copied!');" class="btn-primary">Copy Link</button>
            </div>
        `;
        document.body.appendChild(modal);
    });
}

// Terminal Functions
function handleTerminalInput(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const command = input.value.trim();
        
        if (command) {
            executeTerminalCommand(command);
            window.FlashFusion.state.terminalHistory.push(command);
        }
        
        input.value = '';
    } else if (event.key === 'ArrowUp') {
        // Command history
        const history = window.FlashFusion.state.terminalHistory;
        if (history.length > 0) {
            event.target.value = history[history.length - 1];
        }
    }
}

async function executeTerminalCommand(command) {
    const terminal = document.getElementById('terminal-content');
    
    // Add command to terminal
    terminal.innerHTML += `<div class="terminal-line terminal-command">flashfusion@unified:~$ ${command}</div>`;
    
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1).join(' ');
    
    let output = '';
    
    if (window.FlashFusion.terminalCommands[cmd]) {
        try {
            const result = await window.FlashFusion.terminalCommands[cmd](args);
            output = result || '';
        } catch (error) {
            output = `Error: ${error.message}`;
        }
    } else {
        output = `Command not found: ${cmd}. Type 'help' for available commands.`;
    }
    
    if (output) {
        terminal.innerHTML += `<div class="terminal-line terminal-output">${output}</div>`;
    }
    
    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
    document.getElementById('terminal-content').innerHTML = `
        <div class="terminal-line">FlashFusion Interactive Terminal v2.0.0</div>
        <div class="terminal-line">Type 'help' for available commands</div>
    `;
}

function saveTerminalSession() {
    const content = document.getElementById('terminal-content').innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-session-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccess('Terminal session saved!');
}

// AI Assistant Functions
function loadAIChat() {
    const chatHistory = document.getElementById('ai-chat-history');
    if (chatHistory.children.length === 0) {
        chatHistory.innerHTML = `
            <div class="ai-message assistant">
                <strong>FlashFusion AI:</strong> Hello! I'm your AI assistant. I can help you with:
                <ul>
                    <li>Generate code snippets and scripts</li>
                    <li>Explain FlashFusion concepts and APIs</li>
                    <li>Help with workflow automation</li>
                    <li>Optimize system performance</li>
                    <li>Debug integration issues</li>
                </ul>
                What would you like to work on today?
            </div>
        `;
    }
}

async function sendAIPrompt() {
    const promptInput = document.getElementById('ai-prompt');
    const prompt = promptInput.value.trim();
    const modelSelect = document.getElementById('ai-model-select');
    const selectedModel = modelSelect.value;
    
    if (!prompt) {
        showError('Please enter a prompt');
        return;
    }
    
    const chatHistory = document.getElementById('ai-chat-history');
    
    // Add user message
    chatHistory.innerHTML += `
        <div class="ai-message user">
            <strong>You:</strong> ${prompt}
        </div>
    `;
    
    // Add loading message
    chatHistory.innerHTML += `
        <div class="ai-message assistant loading">
            <strong>${selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} Agent:</strong> 
            <span class="thinking">Thinking...</span>
        </div>
    `;
    
    promptInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    try {
        // Send to FlashFusion agent
        const response = await fetch('/api/v1/agents/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId: selectedModel,
                message: prompt,
                context: { 
                    source: 'ai-assistant',
                    timestamp: new Date().toISOString(),
                    requestType: 'code-generation'
                }
            })
        });
        
        const data = await response.json();
        
        // Remove loading message
        const loadingMessage = chatHistory.querySelector('.loading');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        if (data.success) {
            // Add AI response
            chatHistory.innerHTML += `
                <div class="ai-message assistant">
                    <strong>${selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} Agent:</strong> 
                    ${formatAIResponse(data.data.response)}
                </div>
            `;
            
            // Store in history
            window.FlashFusion.state.aiChatHistory.push({
                prompt: prompt,
                response: data.data.response,
                model: selectedModel,
                timestamp: new Date().toISOString()
            });
            
        } else {
            chatHistory.innerHTML += `
                <div class="ai-message assistant error">
                    <strong>Error:</strong> ${data.error}
                </div>
            `;
        }
        
    } catch (error) {
        // Remove loading message
        const loadingMessage = chatHistory.querySelector('.loading');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        chatHistory.innerHTML += `
            <div class="ai-message assistant error">
                <strong>Network Error:</strong> ${error.message}
            </div>
        `;
    }
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function formatAIResponse(response) {
    // Format code blocks
    let formatted = response.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="code-block ${lang || ''}">${code.trim()}</pre>`;
    });
    
    // Format inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // Format line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

function setAIPrompt(prompt) {
    document.getElementById('ai-prompt').value = prompt;
    document.getElementById('ai-prompt').focus();
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Enhanced modal close handlers
document.addEventListener('DOMContentLoaded', function() {
    // Setup modal close handlers
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.closest('.modal').style.display = 'none';
        };
    });
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
    
    // Handle URL parameters for shared code
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCode = urlParams.get('code');
    if (sharedCode) {
        document.getElementById('code-editor').value = decodeURIComponent(sharedCode);
        openCodeEditor();
        showEditorTab('editor');
        showSuccess('Shared code loaded!');
    }
});

// Add enhanced CSS for interactive elements
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    /* Code Editor Styles */
    .code-editor-container {
        height: 80vh;
        display: flex;
        flex-direction: column;
    }
    
    .editor-tabs {
        display: flex;
        border-bottom: 1px solid rgba(255,255,255,0.2);
        margin-bottom: 1rem;
    }
    
    .editor-toolbar {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: rgba(255,255,255,0.05);
        border-radius: 6px;
    }
    
    .editor-wrapper {
        flex: 1;
        min-height: 200px;
    }
    
    #code-editor {
        width: 100%;
        height: 300px;
        background: #1a1a2e;
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 6px;
        padding: 1rem;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
        resize: vertical;
    }
    
    .code-output {
        margin-top: 1rem;
        background: rgba(0,0,0,0.3);
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.2);
        max-height: 200px;
        overflow-y: auto;
    }
    
    .output-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        background: rgba(255,255,255,0.1);
        border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    
    .output-content {
        padding: 1rem;
        margin: 0;
        white-space: pre-wrap;
        font-family: 'Courier New', monospace;
    }
    
    /* Snippets Styles */
    .snippets-toolbar {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .snippets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1rem;
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .snippet-card {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .snippet-card:hover {
        border-color: #61dafb;
        transform: translateY(-2px);
    }
    
    .snippet-preview {
        background: rgba(0,0,0,0.3);
        padding: 0.5rem;
        border-radius: 4px;
        margin: 0.5rem 0;
        font-family: 'Courier New', monospace;
        font-size: 0.8rem;
        overflow: hidden;
    }
    
    .snippet-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    
    /* Terminal Styles */
    .terminal {
        background: #000;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.3);
        font-family: 'Courier New', monospace;
        height: 400px;
        display: flex;
        flex-direction: column;
    }
    
    .terminal-header {
        background: rgba(255,255,255,0.1);
        padding: 0.5rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.2);
        color: #61dafb;
        font-weight: bold;
    }
    
    .terminal-content {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        color: #00ff00;
    }
    
    .terminal-line {
        margin-bottom: 0.25rem;
        line-height: 1.4;
    }
    
    .terminal-command {
        color: white;
    }
    
    .terminal-output {
        color: #00ff00;
        margin-left: 2rem;
    }
    
    .terminal-input {
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        border-top: 1px solid rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.05);
    }
    
    .terminal-prompt {
        color: #61dafb;
        margin-right: 0.5rem;
    }
    
    .terminal-input input {
        flex: 1;
        background: transparent;
        border: none;
        color: white;
        font-family: 'Courier New', monospace;
        outline: none;
    }
    
    /* AI Assistant Styles */
    .ai-assist-container {
        height: 60vh;
        display: flex;
        flex-direction: column;
    }
    
    .ai-models {
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: rgba(255,255,255,0.05);
        border-radius: 6px;
    }
    
    .ai-chat-history {
        flex: 1;
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 6px;
        padding: 1rem;
        overflow-y: auto;
        margin-bottom: 1rem;
    }
    
    .ai-message {
        margin-bottom: 1rem;
        padding: 0.75rem;
        border-radius: 6px;
        line-height: 1.5;
    }
    
    .ai-message.user {
        background: rgba(97, 218, 251, 0.2);
        border-left: 4px solid #61dafb;
    }
    
    .ai-message.assistant {
        background: rgba(255,255,255,0.1);
        border-left: 4px solid #4ade80;
    }
    
    .ai-message.error {
        background: rgba(239,68,68,0.2);
        border-left: 4px solid #ef4444;
    }
    
    .ai-input {
        display: flex;
        gap: 0.5rem;
    }
    
    .ai-input textarea {
        flex: 1;
        min-height: 60px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 6px;
        padding: 0.75rem;
        color: white;
        resize: vertical;
    }
    
    .ai-suggestions {
        margin-top: 1rem;
    }
    
    .suggestion-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        margin: 0.25rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .suggestion-btn:hover {
        background: rgba(97, 218, 251, 0.2);
        border-color: #61dafb;
    }
    
    .code-block {
        background: rgba(0,0,0,0.5);
        padding: 1rem;
        border-radius: 4px;
        margin: 0.5rem 0;
        overflow-x: auto;
        border-left: 4px solid #61dafb;
    }
    
    .inline-code {
        background: rgba(0,0,0,0.3);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        color: #61dafb;
    }
    
    .thinking {
        animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    /* Enhanced modal styles */
    .modal-content.large {
        max-width: 95vw;
        max-height: 95vh;
        margin: 2.5vh auto;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
        .snippets-grid {
            grid-template-columns: 1fr;
        }
        
        .editor-toolbar {
            flex-direction: column;
            align-items: stretch;
        }
        
        .ai-input {
            flex-direction: column;
        }
        
        .modal-content.large {
            width: 95%;
            height: 95%;
            margin: 2.5% auto;
        }
    }
`;

document.head.appendChild(enhancedStyles);