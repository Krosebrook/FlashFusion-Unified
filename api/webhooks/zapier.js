/**
 * Enhanced Zapier Webhook Handler for FlashFusion
 * Handles automation triggers and actions from Zapier with authentication
 */

const crypto = require('crypto');

module.exports = async (req, res) => {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Zapier-Source, Authorization, X-API-Key, X-Zapier-Signature');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        const url = req.url || '/';
        const zapierSource = req.headers['x-zapier-source'];
        const authorization = req.headers['authorization'];
        const apiKey = req.headers['x-api-key'];
        const zapierSignature = req.headers['x-zapier-signature'];
        
        console.log('Zapier webhook received:', {
            url,
            method: req.method,
            source: zapierSource,
            has_auth: !!authorization,
            has_api_key: !!apiKey,
            has_signature: !!zapierSignature,
            timestamp: new Date().toISOString()
        });

        // Authentication check (skip for public endpoints)
        if (!url.includes('/public/') && !apiKey && !authorization) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Include X-API-Key header or Authorization header',
                documentation: '/api/auth/docs'
            });
        }

        // Route to different Zapier endpoints
        if (url === '/' || url === '/info') {
            return handleZapierInfo(req, res);
        }

        if (url === '/triggers' && req.method === 'GET') {
            return handleListTriggers(req, res);
        }

        if (url === '/actions' && req.method === 'GET') {
            return handleListActions(req, res);
        }

        if (url.startsWith('/trigger/')) {
            return handleZapierTrigger(req, res);
        }

        if (url.startsWith('/action/')) {
            return handleZapierAction(req, res);
        }

        // Legacy endpoints for backward compatibility
        if (req.method === 'GET' && (url === '/poll' || url === '/')) {
            return handleZapierPolling(req, res);
        }

        if (req.method === 'POST' && url === '/') {
            return handleZapierAction(req, res);
        }

        // Webhook testing endpoint
        if (url === '/test') {
            return handleZapierTest(req, res);
        }

        return res.status(404).json({ 
            error: 'Endpoint not found',
            available_endpoints: [
                '/info - Zapier integration info',
                '/triggers - List available triggers',
                '/actions - List available actions',
                '/trigger/{type} - Specific trigger endpoint',
                '/action/{type} - Specific action endpoint',
                '/test - Test webhook endpoint'
            ]
        });

    } catch (error) {
        console.error('Zapier webhook error:', error);
        return res.status(500).json({ 
            error: 'Webhook processing failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Zapier integration info
async function handleZapierInfo(req, res) {
    try {
        return res.status(200).json({
            name: 'FlashFusion Zapier Integration',
            version: '2.0.0',
            description: 'Connect FlashFusion with 5,000+ apps through Zapier',
            capabilities: {
                triggers: ['new_lead', 'new_customer', 'new_order', 'workflow_completed', 'agent_response', 'task_completed', 'error_occurred'],
                actions: ['create_lead', 'send_email', 'create_task', 'update_customer', 'trigger_workflow', 'create_agent', 'send_notification']
            },
            authentication: {
                type: 'API Key',
                header: 'X-API-Key',
                required: true
            },
            endpoints: {
                triggers: '/api/webhooks/zapier/triggers',
                actions: '/api/webhooks/zapier/actions',
                test: '/api/webhooks/zapier/test'
            },
            documentation: 'https://flashfusion.co/docs/zapier',
            support: 'https://flashfusion.co/support'
        });
    } catch (error) {
        console.error('Zapier info error:', error);
        return res.status(500).json({ error: 'Failed to get integration info' });
    }
}

// List available triggers
async function handleListTriggers(req, res) {
    try {
        const triggers = [
            {
                key: 'new_lead',
                name: 'New Lead Created',
                description: 'Triggers when a new lead is generated',
                sample: {
                    id: '12345',
                    name: 'John Doe',
                    email: 'john@example.com',
                    source: 'website',
                    score: 85,
                    created_at: '2025-01-24T12:00:00.000Z'
                }
            },
            {
                key: 'new_customer',
                name: 'New Customer Registered',
                description: 'Triggers when a new customer signs up',
                sample: {
                    id: '67890',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    plan: 'premium',
                    created_at: '2025-01-24T12:00:00.000Z'
                }
            },
            {
                key: 'workflow_completed',
                name: 'Workflow Completed',
                description: 'Triggers when an AI workflow finishes',
                sample: {
                    id: 'wf_12345',
                    name: 'Lead Nurturing',
                    status: 'completed',
                    duration: 1200,
                    results: { tasks_completed: 5, success_rate: 100 },
                    completed_at: '2025-01-24T12:00:00.000Z'
                }
            },
            {
                key: 'agent_response',
                name: 'AI Agent Response',
                description: 'Triggers when an AI agent provides a response',
                sample: {
                    id: 'resp_12345',
                    agent_name: 'Customer Support Bot',
                    customer_email: 'customer@example.com',
                    response: 'Thank you for contacting us!',
                    confidence: 0.95,
                    created_at: '2025-01-24T12:00:00.000Z'
                }
            }
        ];

        return res.status(200).json({
            triggers,
            count: triggers.length,
            documentation: 'https://flashfusion.co/docs/zapier/triggers'
        });
    } catch (error) {
        console.error('List triggers error:', error);
        return res.status(500).json({ error: 'Failed to list triggers' });
    }
}

// List available actions
async function handleListActions(req, res) {
    try {
        const actions = [
            {
                key: 'create_lead',
                name: 'Create Lead',
                description: 'Create a new lead in FlashFusion',
                required_fields: ['name', 'email'],
                optional_fields: ['phone', 'company', 'source', 'notes']
            },
            {
                key: 'send_email',
                name: 'Send Email',
                description: 'Send an email through FlashFusion',
                required_fields: ['to', 'subject', 'body'],
                optional_fields: ['from', 'cc', 'bcc', 'template']
            },
            {
                key: 'create_task',
                name: 'Create Task',
                description: 'Create a new task or todo item',
                required_fields: ['title'],
                optional_fields: ['description', 'assignee', 'due_date', 'priority']
            },
            {
                key: 'trigger_workflow',
                name: 'Trigger Workflow',
                description: 'Start an AI workflow',
                required_fields: ['workflow_id'],
                optional_fields: ['input_data', 'priority', 'schedule']
            },
            {
                key: 'create_agent',
                name: 'Create AI Agent',
                description: 'Create a new AI agent',
                required_fields: ['name', 'type'],
                optional_fields: ['instructions', 'model', 'temperature']
            }
        ];

        return res.status(200).json({
            actions,
            count: actions.length,
            documentation: 'https://flashfusion.co/docs/zapier/actions'
        });
    } catch (error) {
        console.error('List actions error:', error);
        return res.status(500).json({ error: 'Failed to list actions' });
    }
}

// Handle specific trigger requests
async function handleZapierTrigger(req, res) {
    try {
        const triggerType = req.url.split('/trigger/')[1];
        const { limit = 10, since } = req.query;

        console.log('Zapier trigger request:', { triggerType, limit, since });

        let data = [];

        switch (triggerType) {
            case 'new_lead':
                data = await getNewLeads(limit, since);
                break;
            case 'new_customer':
                data = await getNewCustomers(limit, since);
                break;
            case 'new_order':
                data = await getNewOrders(limit, since);
                break;
            case 'workflow_completed':
                data = await getCompletedWorkflows(limit, since);
                break;
            case 'agent_response':
                data = await getAgentResponses(limit, since);
                break;
            case 'task_completed':
                data = await getCompletedTasks(limit, since);
                break;
            case 'error_occurred':
                data = await getSystemErrors(limit, since);
                break;
            default:
                return res.status(400).json({ 
                    error: 'Unknown trigger type',
                    available_triggers: ['new_lead', 'new_customer', 'new_order', 'workflow_completed', 'agent_response', 'task_completed', 'error_occurred']
                });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('Zapier trigger error:', error);
        return res.status(500).json({ 
            error: 'Trigger failed',
            message: error.message 
        });
    }
}

// Test webhook endpoint
async function handleZapierTest(req, res) {
    try {
        const testData = {
            test: true,
            timestamp: new Date().toISOString(),
            webhook_url: req.headers.host + req.url,
            method: req.method,
            headers: Object.keys(req.headers),
            body: req.body || null
        };

        console.log('Zapier test webhook called:', testData);

        return res.status(200).json({
            success: true,
            message: 'Zapier webhook test successful',
            data: testData,
            integration_status: 'active'
        });

    } catch (error) {
        console.error('Zapier test error:', error);
        return res.status(500).json({
            error: 'Test failed',
            message: error.message
        });
    }
}

// Handle Zapier polling triggers (legacy)
async function handleZapierPolling(req, res) {
    const { trigger_type, limit = 10 } = req.query;
    
    console.log('Zapier polling request:', { trigger_type, limit });

    try {
        let data = [];

        switch (trigger_type) {
            case 'new_lead':
                data = await getNewLeads(limit);
                break;
            
            case 'new_customer':
                data = await getNewCustomers(limit);
                break;
            
            case 'new_order':
                data = await getNewOrders(limit);
                break;
            
            case 'workflow_completed':
                data = await getCompletedWorkflows(limit);
                break;
            
            case 'agent_response':
                data = await getAgentResponses(limit);
                break;
            
            default:
                return res.status(400).json({ error: 'Unknown trigger type' });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('Zapier polling error:', error);
        return res.status(500).json({ 
            error: 'Polling failed',
            message: error.message 
        });
    }
}

// Handle Zapier actions
async function handleZapierAction(req, res) {
    const data = req.body;
    const { action_type } = data;
    
    console.log('Zapier action received:', { action_type, data });

    try {
        let result;

        switch (action_type) {
            case 'create_lead':
                result = await createLead(data);
                break;
            
            case 'send_email':
                result = await sendEmail(data);
                break;
            
            case 'create_task':
                result = await createTask(data);
                break;
            
            case 'update_customer':
                result = await updateCustomer(data);
                break;
            
            case 'trigger_workflow':
                result = await triggerWorkflow(data);
                break;
            
            case 'create_agent':
                result = await createAgent(data);
                break;
            
            default:
                return res.status(400).json({ error: 'Unknown action type' });
        }

        return res.status(200).json({
            success: true,
            result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Zapier action error:', error);
        return res.status(500).json({ 
            error: 'Action failed',
            message: error.message 
        });
    }
}

// Polling data functions
async function getNewLeads(limit, since) {
    // TODO: Connect to database and fetch new leads
    const mockLeads = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1-555-0123',
            company: 'Tech Corp',
            source: 'website',
            score: 85,
            interests: ['automation', 'ai'],
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Sarah Wilson',
            email: 'sarah@startup.io',
            phone: '+1-555-0124',
            company: 'Startup Inc',
            source: 'referral',
            score: 92,
            interests: ['saas', 'productivity'],
            created_at: new Date(Date.now() - 3600000).toISOString()
        }
    ];

    let filteredLeads = mockLeads;
    if (since) {
        const sinceDate = new Date(since);
        filteredLeads = mockLeads.filter(lead => new Date(lead.created_at) > sinceDate);
    }

    return filteredLeads.slice(0, limit);
}

async function getNewCustomers(limit) {
    // TODO: Connect to database and fetch new customers
    return [
        {
            id: '1',
            name: 'Jane Smith',
            email: 'jane@example.com',
            status: 'active',
            created_at: new Date().toISOString()
        }
    ].slice(0, limit);
}

async function getNewOrders(limit) {
    // TODO: Connect to database and fetch new orders
    return [
        {
            id: '1',
            customer_email: 'customer@example.com',
            total: 99.99,
            status: 'paid',
            created_at: new Date().toISOString()
        }
    ].slice(0, limit);
}

async function getCompletedWorkflows(limit) {
    // TODO: Connect to database and fetch completed workflows
    return [
        {
            id: '1',
            name: 'Lead Nurturing Sequence',
            status: 'completed',
            completed_at: new Date().toISOString()
        }
    ].slice(0, limit);
}

async function getAgentResponses(limit, since) {
    // TODO: Connect to database and fetch agent responses
    const mockResponses = [
        {
            id: '1',
            agent_name: 'Sales Bot',
            agent_id: 'agent_sales_001',
            customer_email: 'customer@example.com',
            customer_name: 'Mike Johnson',
            response: 'Thank you for your inquiry! I\'ll connect you with our sales team.',
            confidence: 0.95,
            sentiment: 'positive',
            intent: 'sales_inquiry',
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            agent_name: 'Support Bot',
            agent_id: 'agent_support_001',
            customer_email: 'help@example.com',
            customer_name: 'Lisa Chen',
            response: 'I\'ve found a solution to your technical issue.',
            confidence: 0.88,
            sentiment: 'neutral',
            intent: 'technical_support',
            created_at: new Date(Date.now() - 1800000).toISOString()
        }
    ];

    let filteredResponses = mockResponses;
    if (since) {
        const sinceDate = new Date(since);
        filteredResponses = mockResponses.filter(response => new Date(response.created_at) > sinceDate);
    }

    return filteredResponses.slice(0, limit);
}

// New trigger functions
async function getCompletedTasks(limit, since) {
    // TODO: Connect to database and fetch completed tasks
    const mockTasks = [
        {
            id: 'task_001',
            title: 'Review marketing campaign',
            description: 'Analyze Q1 marketing performance',
            assignee: 'marketing@company.com',
            status: 'completed',
            priority: 'high',
            completed_at: new Date().toISOString(),
            duration_minutes: 45
        },
        {
            id: 'task_002',
            title: 'Update customer database',
            description: 'Sync new leads from website',
            assignee: 'sales@company.com',
            status: 'completed',
            priority: 'medium',
            completed_at: new Date(Date.now() - 2700000).toISOString(),
            duration_minutes: 30
        }
    ];

    let filteredTasks = mockTasks;
    if (since) {
        const sinceDate = new Date(since);
        filteredTasks = mockTasks.filter(task => new Date(task.completed_at) > sinceDate);
    }

    return filteredTasks.slice(0, limit);
}

async function getSystemErrors(limit, since) {
    // TODO: Connect to database and fetch system errors
    const mockErrors = [
        {
            id: 'error_001',
            type: 'api_error',
            message: 'Rate limit exceeded for external API',
            severity: 'warning',
            service: 'email_service',
            resolved: false,
            occurred_at: new Date().toISOString(),
            stack_trace: 'Error: Rate limit exceeded at emailService.js:45'
        },
        {
            id: 'error_002',
            type: 'database_error',
            message: 'Connection timeout to customer database',
            severity: 'critical',
            service: 'customer_service',
            resolved: true,
            occurred_at: new Date(Date.now() - 3600000).toISOString(),
            resolved_at: new Date(Date.now() - 3300000).toISOString()
        }
    ];

    let filteredErrors = mockErrors;
    if (since) {
        const sinceDate = new Date(since);
        filteredErrors = mockErrors.filter(error => new Date(error.occurred_at) > sinceDate);
    }

    return filteredErrors.slice(0, limit);
}

// Action functions
async function createLead(data) {
    console.log('Creating lead:', data);
    // TODO: Create lead in database
    return {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        source: data.source || 'zapier',
        created_at: new Date().toISOString()
    };
}

async function sendEmail(data) {
    console.log('Sending email:', data);
    // TODO: Integrate with email service
    return {
        message_id: Date.now().toString(),
        to: data.to,
        subject: data.subject,
        sent_at: new Date().toISOString()
    };
}

async function createTask(data) {
    console.log('Creating task:', data);
    // TODO: Create task in task management system
    return {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        assignee: data.assignee,
        created_at: new Date().toISOString()
    };
}

async function updateCustomer(data) {
    console.log('Updating customer:', data);
    // TODO: Update customer in database
    return {
        id: data.id,
        updated_fields: Object.keys(data).filter(key => key !== 'id'),
        updated_at: new Date().toISOString()
    };
}

async function triggerWorkflow(data) {
    console.log('Triggering workflow:', data);
    // TODO: Trigger workflow execution
    return {
        workflow_id: data.workflow_id,
        execution_id: Date.now().toString(),
        status: 'started',
        started_at: new Date().toISOString()
    };
}

async function createAgent(data) {
    console.log('Creating agent:', data);
    // TODO: Create AI agent
    return {
        id: Date.now().toString(),
        name: data.name,
        type: data.type,
        instructions: data.instructions,
        created_at: new Date().toISOString()
    };
}