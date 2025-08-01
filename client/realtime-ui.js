/**
 * FlashFusion Real-time UI Development Client
 * Provides live UI updates without page refresh
 */
class FlashFusionRealtimeUI {
    constructor(config = {}) {
        this.config = {
            serverUrl: config.serverUrl || 'ws://localhost:3001',
            projectId: config.projectId || 'default',
            autoConnect: config.autoConnect !== false,
            enableHotReload: config.enableHotReload !== false,
            enableFigmaSync: config.enableFigmaSync || false,
            updateAnimations: config.updateAnimations !== false,
            ...config
        };

        this.socket = null;
        this.connected = false;
        this.projectState = {};
        this.componentRegistry = new Map();
        this.styleRegistry = new Map();
        this.eventHandlers = new Map();
        
        this.initializeEventSystem();
        
        if (this.config.autoConnect) {
            this.connect();
        }
    }

    /**
     * Initialize event system
     */
    initializeEventSystem() {
        // Create custom events
        this.events = {
            connected: new CustomEvent('flashfusion:connected'),
            disconnected: new CustomEvent('flashfusion:disconnected'),
            componentUpdated: new CustomEvent('flashfusion:component-updated'),
            styleUpdated: new CustomEvent('flashfusion:style-updated'),
            figmaSynced: new CustomEvent('flashfusion:figma-synced')
        };
    }

    /**
     * Connect to real-time server
     */
    async connect() {
        if (this.connected) return;

        try {
            // Import Socket.IO client
            const { io } = await import('/socket.io/socket.io.esm.min.js');
            
            this.socket = io(this.config.serverUrl, {
                transports: ['websocket', 'polling']
            });

            this.setupSocketHandlers();
            
        } catch (error) {
            console.error('Failed to connect to FlashFusion UI server:', error);
            
            // Fallback to polling mode
            this.setupPollingMode();
        }
    }

    /**
     * Setup Socket.IO event handlers
     */
    setupSocketHandlers() {
        this.socket.on('connect', () => {
            console.log('🚀 FlashFusion Real-time UI connected');
            this.connected = true;
            this.joinProject();
            document.dispatchEvent(this.events.connected);
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 FlashFusion Real-time UI disconnected');
            this.connected = false;
            document.dispatchEvent(this.events.disconnected);
        });

        this.socket.on('project-state', (state) => {
            this.projectState = state;
            this.applyProjectState(state);
        });

        this.socket.on('ui-updated', (data) => {
            this.handleUIUpdate(data);
        });

        this.socket.on('ui-live-update', (data) => {
            this.handleLiveUpdate(data);
        });

        this.socket.on('component-changed', (data) => {
            this.handleComponentChange(data);
        });

        this.socket.on('styles-updated', (data) => {
            this.handleStyleUpdate(data);
        });

        this.socket.on('figma-synced', (data) => {
            this.handleFigmaSync(data);
        });
    }

    /**
     * Setup polling mode as fallback
     */
    setupPollingMode() {
        console.warn('🔄 Using polling mode for FlashFusion updates');
        
        setInterval(async () => {
            try {
                const response = await fetch(`${this.config.serverUrl.replace('ws://', 'http://')}/api/ui-agent/status`);
                const status = await response.json();
                
                // Check for updates
                if (status.lastUpdate && status.lastUpdate !== this.lastUpdate) {
                    this.fetchProjectState();
                    this.lastUpdate = status.lastUpdate;
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 1000);
    }

    /**
     * Join project room
     */
    joinProject() {
        if (this.socket && this.connected) {
            this.socket.emit('join-project', this.config.projectId);
        }
    }

    /**
     * Apply project state to DOM
     */
    applyProjectState(state) {
        if (!state) return;

        // Apply components
        if (state.components) {
            state.components.forEach(component => {
                this.applyComponent(component);
            });
        }

        // Apply styles
        if (state.styles) {
            this.applyStyles(state.styles);
        }
    }

    /**
     * Handle UI updates
     */
    handleUIUpdate(data) {
        const { component, changes, timestamp } = data;
        
        if (this.config.updateAnimations) {
            this.animateUpdate(component, changes);
        } else {
            this.applyChanges(component, changes);
        }

        // Dispatch custom event
        const event = new CustomEvent('flashfusion:component-updated', {
            detail: { component, changes, timestamp }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle live updates (real-time property changes)
     */
    handleLiveUpdate(data) {
        const { component, data: updateData, timestamp } = data;
        
        // Find elements with matching component class
        const elements = document.querySelectorAll(`.${component}`);
        
        elements.forEach(element => {
            this.applyLivePropertyUpdate(element, updateData);
        });
    }

    /**
     * Apply live property update to element
     */
    applyLivePropertyUpdate(element, updateData) {
        const { property, value, animation } = updateData;
        
        // Convert property to CSS property
        const cssProperty = this.convertToCSSProperty(property);
        
        if (animation && animation !== 'none') {
            // Apply with animation
            element.style.transition = `${cssProperty} 0.3s ease`;
            element.style[cssProperty] = value;
        } else {
            // Apply directly
            element.style[cssProperty] = value;
        }
    }

    /**
     * Handle component changes
     */
    handleComponentChange(data) {
        const { componentId, changes, author, timestamp } = data;
        
        if (author !== this.socket?.id) {
            this.updateComponent(componentId, changes);
        }
    }

    /**
     * Handle style updates
     */
    handleStyleUpdate(data) {
        const { selector, styles, timestamp } = data;
        
        this.updateStyles(selector, styles);
        
        // Dispatch custom event
        const event = new CustomEvent('flashfusion:style-updated', {
            detail: { selector, styles, timestamp }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle Figma sync
     */
    handleFigmaSync(data) {
        const { components, styles, timestamp } = data;
        
        console.log('🎨 Figma design synced:', components.length, 'components');
        
        // Apply Figma components
        components.forEach(component => {
            this.applyFigmaComponent(component);
        });
        
        // Apply Figma styles
        if (styles) {
            this.applyStyles(styles);
        }
        
        // Dispatch custom event
        const event = new CustomEvent('flashfusion:figma-synced', {
            detail: { components, styles, timestamp }
        });
        document.dispatchEvent(event);
    }

    /**
     * Apply component to DOM
     */
    applyComponent(component) {
        const { id, type, content, props, styles } = component;
        
        // Find or create component container
        let container = document.getElementById(`ff-component-${id}`);
        if (!container) {
            container = document.createElement('div');
            container.id = `ff-component-${id}`;
            container.className = `flashfusion-component ${id}`;
            document.body.appendChild(container);
        }
        
        // Update content
        if (content) {
            container.innerHTML = content;
        }
        
        // Apply styles
        if (styles) {
            Object.assign(container.style, styles);
        }
        
        // Store in registry
        this.componentRegistry.set(id, component);
    }

    /**
     * Apply Figma component
     */
    applyFigmaComponent(component) {
        // Convert Figma component to HTML
        const htmlComponent = this.convertFigmaToHTML(component);
        this.applyComponent(htmlComponent);
    }

    /**
     * Convert Figma component to HTML structure
     */
    convertFigmaToHTML(figmaComponent) {
        return {
            id: figmaComponent.id || `figma-${Date.now()}`,
            type: 'figma-component',
            content: this.generateHTMLFromFigma(figmaComponent),
            styles: this.extractFigmaStyles(figmaComponent)
        };
    }

    /**
     * Generate HTML from Figma component
     */
    generateHTMLFromFigma(figmaComponent) {
        // This would contain actual Figma-to-HTML conversion logic
        // For now, return a placeholder
        return `
            <div class="figma-component" data-figma-id="${figmaComponent.id}">
                <h3>${figmaComponent.name || 'Figma Component'}</h3>
                <p>Component synced from Figma</p>
            </div>
        `;
    }

    /**
     * Extract styles from Figma component
     */
    extractFigmaStyles(figmaComponent) {
        // Extract and convert Figma styles to CSS
        const styles = {};
        
        if (figmaComponent.fills) {
            styles.backgroundColor = this.convertFigmaColor(figmaComponent.fills[0]);
        }
        
        if (figmaComponent.cornerRadius) {
            styles.borderRadius = `${figmaComponent.cornerRadius}px`;
        }
        
        return styles;
    }

    /**
     * Apply styles to DOM
     */
    applyStyles(styles) {
        Object.entries(styles).forEach(([selector, rules]) => {
            this.updateStyles(selector, rules);
        });
    }

    /**
     * Update styles for a selector
     */
    updateStyles(selector, styles) {
        // Create or update style element
        let styleElement = document.getElementById('flashfusion-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'flashfusion-styles';
            document.head.appendChild(styleElement);
        }
        
        // Generate CSS rule
        const cssRule = this.generateCSSRule(selector, styles);
        
        // Update stylesheet
        if (styleElement.sheet) {
            styleElement.sheet.insertRule(cssRule, styleElement.sheet.cssRules.length);
        } else {
            styleElement.textContent += cssRule + '\\n';
        }
        
        // Store in registry
        this.styleRegistry.set(selector, styles);
    }

    /**
     * Generate CSS rule from styles object
     */
    generateCSSRule(selector, styles) {
        const properties = Object.entries(styles)
            .map(([property, value]) => `${this.convertToCSSProperty(property)}: ${value}`)
            .join('; ');
            
        return `${selector} { ${properties}; }`;
    }

    /**
     * Animate update
     */
    animateUpdate(component, changes) {
        const elements = document.querySelectorAll(`.${component}`);
        
        elements.forEach(element => {
            // Add transition effect
            element.style.transition = 'all 0.3s ease';
            
            // Apply changes
            this.applyChanges(component, changes, element);
            
            // Add visual feedback
            element.classList.add('ff-updating');
            setTimeout(() => {
                element.classList.remove('ff-updating');
            }, 300);
        });
    }

    /**
     * Apply changes to component
     */
    applyChanges(component, changes, targetElement = null) {
        const elements = targetElement ? [targetElement] : document.querySelectorAll(`.${component}`);
        
        elements.forEach(element => {
            if (changes.css) {
                this.applyCSSChanges(element, changes.css);
            }
            
            if (changes.js) {
                this.applyJSChanges(element, changes.js);
            }
            
            if (changes.content) {
                element.innerHTML = changes.content;
            }
        });
    }

    /**
     * Apply CSS changes to element
     */
    applyCSSChanges(element, css) {
        // Parse CSS and apply to element
        const rules = this.parseCSS(css);
        Object.assign(element.style, rules);
    }

    /**
     * Apply JavaScript changes
     */
    applyJSChanges(element, js) {
        try {
            // Execute JS in context of element
            const func = new Function('element', js);
            func(element);
        } catch (error) {
            console.error('Error applying JS changes:', error);
        }
    }

    /**
     * Parse CSS string to object
     */
    parseCSS(cssString) {
        const rules = {};
        const declarations = cssString.split(';');
        
        declarations.forEach(declaration => {
            const [property, value] = declaration.split(':').map(s => s.trim());
            if (property && value) {
                const camelCaseProperty = this.convertToCamelCase(property);
                rules[camelCaseProperty] = value;
            }
        });
        
        return rules;
    }

    /**
     * Request UI update
     */
    requestUIUpdate(component, property, value, animation = 'ease') {
        if (this.socket && this.connected) {
            this.socket.emit('ui-update-request', {
                component,
                property,
                value,
                animation
            });
        }
    }

    /**
     * Request component change
     */
    requestComponentChange(componentId, changes) {
        if (this.socket && this.connected) {
            this.socket.emit('component-change', {
                componentId,
                changes
            });
        }
    }

    /**
     * Request style update
     */
    requestStyleUpdate(selector, styles) {
        if (this.socket && this.connected) {
            this.socket.emit('style-update', {
                selector,
                styles
            });
        }
    }

    /**
     * Request Figma sync
     */
    requestFigmaSync(figmaUrl) {
        if (this.socket && this.connected) {
            this.socket.emit('figma-sync-request', {
                figmaUrl
            });
        }
    }

    /**
     * Utility: Convert CSS property to camelCase
     */
    convertToCamelCase(cssProperty) {
        return cssProperty.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }

    /**
     * Utility: Convert camelCase to CSS property
     */
    convertToCSSProperty(camelCase) {
        return camelCase.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    /**
     * Utility: Convert Figma color to CSS
     */
    convertFigmaColor(figmaColor) {
        if (figmaColor.type === 'SOLID') {
            const { r, g, b, a = 1 } = figmaColor.color;
            return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
        }
        return '#000000';
    }

    /**
     * Enable hot reload for development
     */
    enableHotReload() {
        if (!this.config.enableHotReload) return;
        
        // Watch for file changes
        this.socket?.emit('enable-hot-reload', {
            projectId: this.config.projectId
        });
        
        // Listen for hot reload events
        this.socket?.on('hot-reload', (data) => {
            console.log('🔥 Hot reloading:', data.file);
            
            if (data.type === 'css') {
                this.reloadCSS(data.content);
            } else if (data.type === 'js') {
                this.reloadJS(data.content);
            } else if (data.type === 'html') {
                this.reloadHTML(data.content);
            }
        });
    }

    /**
     * Reload CSS without page refresh
     */
    reloadCSS(content) {
        const styleElements = document.querySelectorAll('link[rel="stylesheet"], style');
        styleElements.forEach(element => {
            if (element.tagName === 'LINK') {
                element.href = element.href.split('?')[0] + '?t=' + Date.now();
            }
        });
    }

    /**
     * Reload JavaScript modules
     */
    reloadJS(content) {
        // This would contain module hot replacement logic
        console.log('🔄 JavaScript hot reload triggered');
    }

    /**
     * Reload HTML content
     */
    reloadHTML(content) {
        // Update specific components rather than full page reload
        console.log('🔄 HTML hot reload triggered');
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.connected = false;
        }
    }

    /**
     * Get connection status
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Get project state
     */
    getProjectState() {
        return this.projectState;
    }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    window.FlashFusionRealtimeUI = FlashFusionRealtimeUI;
    
    // Auto-connect if config exists
    if (window.flashfusionConfig) {
        window.flashfusion = new FlashFusionRealtimeUI(window.flashfusionConfig);
    }
}

export default FlashFusionRealtimeUI;