import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import winston from 'winston';
import fs from 'fs/promises';
import path from 'path';

/**
 * Real-time UI Development Agent
 * Provides live UI updates without page refresh using WebSockets
 */
class RealtimeUIAgent {
    constructor(config = {}) {
        this.config = {
            port: config.port || 3001,
            updateFrequency: config.updateFrequency || 100,
            maxConnections: config.maxConnections || 1000,
            enableFigmaSync: config.enableFigmaSync || true,
            ...config
        };

        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/ui-agent.log' }),
                new winston.transports.Console()
            ]
        });

        this.connectedClients = new Map();
        this.activeProjects = new Map();
        this.componentCache = new Map();
        this.updateQueue = [];

        this.setupEventHandlers();
        this.setupAPIEndpoints();
    }

    /**
     * Setup WebSocket event handlers
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            this.logger.info(`Client connected: ${socket.id}`);
            
            this.connectedClients.set(socket.id, {
                id: socket.id,
                connectedAt: new Date(),
                project: null,
                preferences: {}
            });

            socket.on('join-project', (projectId) => {
                this.handleJoinProject(socket, projectId);
            });

            socket.on('ui-update-request', (data) => {
                this.handleUIUpdateRequest(socket, data);
            });

            socket.on('component-change', (data) => {
                this.handleComponentChange(socket, data);
            });

            socket.on('style-update', (data) => {
                this.handleStyleUpdate(socket, data);
            });

            socket.on('figma-sync-request', (data) => {
                this.handleFigmaSyncRequest(socket, data);
            });

            socket.on('disconnect', () => {
                this.logger.info(`Client disconnected: ${socket.id}`);
                this.connectedClients.delete(socket.id);
            });
        });
    }

    /**
     * Setup REST API endpoints
     */
    setupAPIEndpoints() {
        this.app.use(express.json());

        // Get agent status
        this.app.get('/api/ui-agent/status', (req, res) => {
            res.json({
                status: 'active',
                connectedClients: this.connectedClients.size,
                activeProjects: this.activeProjects.size,
                config: this.config
            });
        });

        // Trigger UI update
        this.app.post('/api/ui-agent/update', async (req, res) => {
            try {
                const { projectId, component, data } = req.body;
                await this.broadcastUIUpdate(projectId, component, data);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Generate component
        this.app.post('/api/ui-agent/generate-component', async (req, res) => {
            try {
                const { projectId, componentSpec } = req.body;
                const component = await this.generateComponent(componentSpec);
                await this.broadcastComponentGenerated(projectId, component);
                res.json({ component });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Update styles
        this.app.post('/api/ui-agent/update-styles', async (req, res) => {
            try {
                const { projectId, styles } = req.body;
                await this.updateProjectStyles(projectId, styles);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    /**
     * Handle client joining a project
     */
    handleJoinProject(socket, projectId) {
        const client = this.connectedClients.get(socket.id);
        if (client) {
            client.project = projectId;
            socket.join(`project-${projectId}`);
            
            if (!this.activeProjects.has(projectId)) {
                this.activeProjects.set(projectId, {
                    id: projectId,
                    clients: new Set(),
                    components: new Map(),
                    styles: {},
                    lastUpdate: new Date()
                });
            }
            
            this.activeProjects.get(projectId).clients.add(socket.id);
            
            this.logger.info(`Client ${socket.id} joined project ${projectId}`);
            
            // Send current project state
            socket.emit('project-state', this.getProjectState(projectId));
        }
    }

    /**
     * Handle UI update requests
     */
    async handleUIUpdateRequest(socket, data) {
        const client = this.connectedClients.get(socket.id);
        if (!client || !client.project) return;

        try {
            const updateResult = await this.processUIUpdate(client.project, data);
            
            // Broadcast to all clients in the project
            this.io.to(`project-${client.project}`).emit('ui-updated', {
                component: data.component,
                changes: updateResult,
                timestamp: new Date()
            });
            
        } catch (error) {
            socket.emit('ui-update-error', { error: error.message });
        }
    }

    /**
     * Handle component changes
     */
    async handleComponentChange(socket, data) {
        const client = this.connectedClients.get(socket.id);
        if (!client || !client.project) return;

        try {
            await this.updateComponent(client.project, data.componentId, data.changes);
            
            // Broadcast component change to other clients
            socket.to(`project-${client.project}`).emit('component-changed', {
                componentId: data.componentId,
                changes: data.changes,
                author: socket.id,
                timestamp: new Date()
            });
            
        } catch (error) {
            socket.emit('component-change-error', { error: error.message });
        }
    }

    /**
     * Handle style updates
     */
    async handleStyleUpdate(socket, data) {
        const client = this.connectedClients.get(socket.id);
        if (!client || !client.project) return;

        try {
            await this.updateStyles(client.project, data.selector, data.styles);
            
            // Broadcast style update
            this.io.to(`project-${client.project}`).emit('styles-updated', {
                selector: data.selector,
                styles: data.styles,
                timestamp: new Date()
            });
            
        } catch (error) {
            socket.emit('style-update-error', { error: error.message });
        }
    }

    /**
     * Handle Figma sync requests
     */
    async handleFigmaSyncRequest(socket, data) {
        if (!this.config.enableFigmaSync) {
            socket.emit('figma-sync-error', { error: 'Figma sync is disabled' });
            return;
        }

        const client = this.connectedClients.get(socket.id);
        if (!client || !client.project) return;

        try {
            const syncResult = await this.syncWithFigma(client.project, data.figmaUrl);
            
            // Broadcast Figma sync result
            this.io.to(`project-${client.project}`).emit('figma-synced', {
                components: syncResult.components,
                styles: syncResult.styles,
                timestamp: new Date()
            });
            
        } catch (error) {
            socket.emit('figma-sync-error', { error: error.message });
        }
    }

    /**
     * Process UI updates in real-time
     */
    async processUIUpdate(projectId, updateData) {
        const project = this.activeProjects.get(projectId);
        if (!project) throw new Error('Project not found');

        const { component, property, value, animation } = updateData;

        // Apply update
        const update = {
            component,
            property,
            value,
            animation: animation || 'none',
            timestamp: new Date()
        };

        // Store in project state
        if (!project.components.has(component)) {
            project.components.set(component, {});
        }
        
        project.components.get(component)[property] = value;
        project.lastUpdate = new Date();

        // Generate CSS/JS for the update
        const cssUpdate = this.generateCSSUpdate(component, property, value);
        const jsUpdate = this.generateJSUpdate(component, property, value);

        return {
            css: cssUpdate,
            js: jsUpdate,
            animation: animation
        };
    }

    /**
     * Generate CSS for real-time updates
     */
    generateCSSUpdate(component, property, value) {
        const cssProperty = this.convertToCSSProperty(property);
        const cssValue = this.convertToCSSValue(value);
        
        return `
            .${component} {
                ${cssProperty}: ${cssValue};
                transition: ${cssProperty} 0.3s ease;
            }
        `;
    }

    /**
     * Generate JavaScript for real-time updates
     */
    generateJSUpdate(component, property, value) {
        return `
            document.querySelectorAll('.${component}').forEach(el => {
                el.style.${this.convertToCSSProperty(property)} = '${value}';
            });
        `;
    }

    /**
     * Update component in project
     */
    async updateComponent(projectId, componentId, changes) {
        const project = this.activeProjects.get(projectId);
        if (!project) throw new Error('Project not found');

        if (!project.components.has(componentId)) {
            project.components.set(componentId, {});
        }

        const component = project.components.get(componentId);
        Object.assign(component, changes);

        // Generate updated component code
        const componentCode = await this.generateComponentCode(componentId, component);
        
        // Save to file system
        await this.saveComponentToFile(projectId, componentId, componentCode);
        
        project.lastUpdate = new Date();
    }

    /**
     * Generate component code
     */
    async generateComponentCode(componentId, componentData) {
        const { framework = 'react' } = componentData;
        
        switch (framework) {
            case 'react':
                return this.generateReactComponent(componentId, componentData);
            case 'angular':
                return this.generateAngularComponent(componentId, componentData);
            case 'vue':
                return this.generateVueComponent(componentId, componentData);
            default:
                return this.generateHTMLComponent(componentId, componentData);
        }
    }

    /**
     * Generate React component
     */
    generateReactComponent(componentId, data) {
        const componentName = this.pascalCase(componentId);
        
        return `
import React from 'react';
import './${componentId}.css';

const ${componentName} = ({ ${Object.keys(data.props || {}).join(', ')} }) => {
    return (
        <div className="${componentId}">
            ${data.content || `<h1>Hello from ${componentName}!</h1>`}
        </div>
    );
};

export default ${componentName};
        `.trim();
    }

    /**
     * Generate Angular component
     */
    generateAngularComponent(componentId, data) {
        const componentName = this.pascalCase(componentId);
        
        return `
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-${componentId}',
    template: \`
        <div class="${componentId}">
            ${data.content || `<h1>Hello from ${componentName}!</h1>`}
        </div>
    \`,
    styleUrls: ['./${componentId}.component.css']
})
export class ${componentName}Component {
    ${Object.entries(data.props || {}).map(([key, type]) => 
        `@Input() ${key}: ${type};`
    ).join('\n    ')}
}
        `.trim();
    }

    /**
     * Generate Vue component
     */
    generateVueComponent(componentId, data) {
        return `
<template>
    <div class="${componentId}">
        ${data.content || `<h1>Hello from ${this.pascalCase(componentId)}!</h1>`}
    </div>
</template>

<script>
export default {
    name: '${this.pascalCase(componentId)}',
    props: {
        ${Object.entries(data.props || {}).map(([key, type]) => 
            `${key}: ${type}`
        ).join(',\n        ')}
    }
}
</script>

<style scoped>
@import './${componentId}.css';
</style>
        `.trim();
    }

    /**
     * Save component to file system
     */
    async saveComponentToFile(projectId, componentId, code) {
        const projectDir = path.join(process.cwd(), 'projects', projectId, 'components');
        await fs.mkdir(projectDir, { recursive: true });
        
        const filePath = path.join(projectDir, `${componentId}.jsx`);
        await fs.writeFile(filePath, code, 'utf8');
    }

    /**
     * Sync with Figma designs
     */
    async syncWithFigma(projectId, figmaUrl) {
        if (!process.env.FIGMA_API_KEY) {
            throw new Error('Figma API key not configured');
        }

        // Extract file ID from Figma URL
        const fileId = this.extractFigmaFileId(figmaUrl);
        
        // Fetch design data from Figma API
        const figmaData = await this.fetchFigmaData(fileId);
        
        // Convert Figma designs to components
        const components = await this.convertFigmaToComponents(figmaData);
        
        // Update project with new components
        const project = this.activeProjects.get(projectId);
        if (project) {
            components.forEach(component => {
                project.components.set(component.id, component);
            });
        }

        return {
            components: components.map(c => ({ id: c.id, name: c.name })),
            styles: figmaData.styles
        };
    }

    /**
     * Broadcast UI update to project clients
     */
    async broadcastUIUpdate(projectId, component, data) {
        this.io.to(`project-${projectId}`).emit('ui-live-update', {
            component,
            data,
            timestamp: new Date()
        });
    }

    /**
     * Get current project state
     */
    getProjectState(projectId) {
        const project = this.activeProjects.get(projectId);
        if (!project) return null;

        return {
            id: projectId,
            components: Array.from(project.components.entries()).map(([id, data]) => ({
                id,
                ...data
            })),
            styles: project.styles,
            lastUpdate: project.lastUpdate
        };
    }

    /**
     * Utility: Convert to PascalCase
     */
    pascalCase(str) {
        return str.replace(/(?:^|-)(.)/g, (_, c) => c.toUpperCase());
    }

    /**
     * Utility: Convert property to CSS property
     */
    convertToCSSProperty(property) {
        return property.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    /**
     * Utility: Convert value to CSS value
     */
    convertToCSSValue(value) {
        if (typeof value === 'number') {
            return `${value}px`;
        }
        return value;
    }

    /**
     * Start the UI agent server
     */
    async start() {
        return new Promise((resolve) => {
            this.server.listen(this.config.port, () => {
                this.logger.info(`Real-time UI Agent listening on port ${this.config.port}`);
                resolve();
            });
        });
    }

    /**
     * Stop the UI agent server
     */
    async stop() {
        return new Promise((resolve) => {
            this.server.close(() => {
                this.logger.info('Real-time UI Agent stopped');
                resolve();
            });
        });
    }

    /**
     * Health check
     */
    healthCheck() {
        return {
            status: 'healthy',
            connectedClients: this.connectedClients.size,
            activeProjects: this.activeProjects.size,
            uptime: process.uptime()
        };
    }
}

export default RealtimeUIAgent;