/**
 * Codebase Analyzer
 * Comprehensive tool for exploring and analyzing the codebase structure
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class CodebaseAnalyzer extends EventEmitter {
    constructor(debugCore, options = {}) {
        super();
        
        this.debugCore = debugCore;
        this.config = {
            rootPath: options.rootPath || process.cwd(),
            excludePatterns: options.excludePatterns || [
                'node_modules',
                '.git',
                'dist',
                'build',
                '.next',
                'coverage',
                '.nyc_output',
                'logs',
                '*.log'
            ],
            includeExtensions: options.includeExtensions || [
                '.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.yml', '.yaml', '.env'
            ],
            maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB
            enableMetrics: options.enableMetrics !== false,
            enableDependencyAnalysis: options.enableDependencyAnalysis !== false,
            ...options
        };

        this.cache = {
            fileTree: null,
            metrics: null,
            dependencies: null,
            lastScan: null
        };
    }

    async analyzeCodebase(options = {}) {
        const startTime = this.debugCore.startTimer('codebase_analysis');
        
        this.debugCore.info('CODEBASE_ANALYZER', 'Starting codebase analysis', {
            rootPath: this.config.rootPath,
            options
        });

        try {
            const analysis = {
                timestamp: new Date().toISOString(),
                rootPath: this.config.rootPath,
                fileTree: await this.buildFileTree(),
                metrics: this.config.enableMetrics ? await this.calculateMetrics() : null,
                dependencies: this.config.enableDependencyAnalysis ? await this.analyzeDependencies() : null,
                structure: await this.analyzeStructure(),
                patterns: await this.identifyPatterns()
            };

            this.cache.lastScan = analysis.timestamp;
            this.emit('analysis:complete', analysis);
            
            this.debugCore.endTimer(startTime, { 
                filesAnalyzed: analysis.metrics?.totalFiles || 0,
                linesOfCode: analysis.metrics?.totalLines || 0
            });

            return analysis;
        } catch (error) {
            this.debugCore.error('CODEBASE_ANALYZER', 'Analysis failed', error);
            this.debugCore.endTimer(startTime, { error: error.message });
            throw error;
        }
    }

    async buildFileTree(dirPath = this.config.rootPath, depth = 0) {
        const maxDepth = 10; // Prevent infinite recursion
        if (depth > maxDepth) return null;

        try {
            const stats = await fs.stat(dirPath);
            const relativePath = path.relative(this.config.rootPath, dirPath);
            const name = path.basename(dirPath);

            // Check if should be excluded
            if (this.shouldExclude(relativePath, name)) {
                return null;
            }

            const node = {
                name,
                path: relativePath || '.',
                absolutePath: dirPath,
                type: stats.isDirectory() ? 'directory' : 'file',
                size: stats.size,
                modified: stats.mtime,
                created: stats.birthtime
            };

            if (stats.isDirectory()) {
                try {
                    const entries = await fs.readdir(dirPath);
                    node.children = [];
                    
                    for (const entry of entries) {
                        const childPath = path.join(dirPath, entry);
                        const childNode = await this.buildFileTree(childPath, depth + 1);
                        if (childNode) {
                            node.children.push(childNode);
                        }
                    }
                    
                    node.childCount = node.children.length;
                } catch (error) {
                    this.debugCore.warn('CODEBASE_ANALYZER', `Cannot read directory: ${dirPath}`, error.message);
                    node.error = error.message;
                }
            } else {
                // Add file-specific metadata
                node.extension = path.extname(name);
                node.isCode = this.isCodeFile(node.extension);
                
                if (node.isCode && node.size < this.config.maxFileSize) {
                    try {
                        const content = await fs.readFile(dirPath, 'utf8');
                        node.lineCount = content.split('\n').length;
                        node.charCount = content.length;
                        node.encoding = 'utf8';
                        
                        // Basic code analysis
                        if (node.extension === '.js' || node.extension === '.ts') {
                            node.codeMetrics = this.analyzeJavaScriptFile(content);
                        }
                    } catch (error) {
                        this.debugCore.warn('CODEBASE_ANALYZER', `Cannot read file: ${dirPath}`, error.message);
                        node.error = error.message;
                    }
                }
            }

            return node;
        } catch (error) {
            this.debugCore.warn('CODEBASE_ANALYZER', `Cannot access: ${dirPath}`, error.message);
            return null;
        }
    }

    async calculateMetrics() {
        if (!this.cache.fileTree) {
            this.cache.fileTree = await this.buildFileTree();
        }

        const metrics = {
            totalFiles: 0,
            totalDirectories: 0,
            totalSize: 0,
            totalLines: 0,
            byExtension: {},
            byType: {
                code: 0,
                config: 0,
                documentation: 0,
                assets: 0,
                other: 0
            },
            codeMetrics: {
                functions: 0,
                classes: 0,
                imports: 0,
                exports: 0,
                comments: 0
            }
        };

        const traverseTree = (node) => {
            if (node.type === 'directory') {
                metrics.totalDirectories++;
                if (node.children) {
                    node.children.forEach(traverseTree);
                }
            } else {
                metrics.totalFiles++;
                metrics.totalSize += node.size || 0;
                metrics.totalLines += node.lineCount || 0;

                // Count by extension
                const ext = node.extension || 'no-extension';
                metrics.byExtension[ext] = (metrics.byExtension[ext] || 0) + 1;

                // Count by type
                const fileType = this.categorizeFile(node);
                metrics.byType[fileType]++;

                // Aggregate code metrics
                if (node.codeMetrics) {
                    Object.keys(metrics.codeMetrics).forEach(key => {
                        metrics.codeMetrics[key] += node.codeMetrics[key] || 0;
                    });
                }
            }
        };

        if (this.cache.fileTree) {
            traverseTree(this.cache.fileTree);
        }

        this.cache.metrics = metrics;
        return metrics;
    }

    async analyzeDependencies() {
        const dependencies = {
            packageJson: null,
            installed: [],
            missing: [],
            unused: [],
            outdated: [],
            security: []
        };

        try {
            // Analyze package.json
            const packageJsonPath = path.join(this.config.rootPath, 'package.json');
            const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
            dependencies.packageJson = JSON.parse(packageJsonContent);

            // Find all require/import statements
            const importedModules = new Set();
            await this.findImports(this.cache.fileTree, importedModules);

            // Compare with package.json dependencies
            const declaredDeps = {
                ...dependencies.packageJson.dependencies || {},
                ...dependencies.packageJson.devDependencies || {}
            };

            // Find unused dependencies
            for (const dep of Object.keys(declaredDeps)) {
                if (!importedModules.has(dep)) {
                    dependencies.unused.push(dep);
                }
            }

            // Find missing dependencies
            for (const imported of importedModules) {
                if (!declaredDeps[imported] && !this.isBuiltinModule(imported)) {
                    dependencies.missing.push(imported);
                }
            }

            dependencies.installed = Object.keys(declaredDeps);

        } catch (error) {
            this.debugCore.warn('CODEBASE_ANALYZER', 'Dependency analysis failed', error.message);
        }

        return dependencies;
    }

    async analyzeStructure() {
        const structure = {
            patterns: [],
            architecture: null,
            frameworks: [],
            buildTools: [],
            testFrameworks: []
        };

        if (!this.cache.fileTree) {
            this.cache.fileTree = await this.buildFileTree();
        }

        // Detect architectural patterns
        structure.patterns = this.detectArchitecturalPatterns(this.cache.fileTree);
        
        // Detect frameworks and tools
        structure.frameworks = this.detectFrameworks(this.cache.fileTree);
        structure.buildTools = this.detectBuildTools(this.cache.fileTree);
        structure.testFrameworks = this.detectTestFrameworks(this.cache.fileTree);

        return structure;
    }

    async identifyPatterns() {
        const patterns = {
            naming: {},
            organization: {},
            complexity: {},
            duplicates: []
        };

        // Analyze naming patterns
        patterns.naming = this.analyzeNamingPatterns(this.cache.fileTree);
        
        // Analyze organization patterns
        patterns.organization = this.analyzeOrganizationPatterns(this.cache.fileTree);

        return patterns;
    }

    analyzeJavaScriptFile(content) {
        const metrics = {
            functions: 0,
            classes: 0,
            imports: 0,
            exports: 0,
            comments: 0,
            complexity: 0
        };

        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Count functions
            if (trimmed.match(/^(function|const\s+\w+\s*=\s*\(|async\s+function)/)) {
                metrics.functions++;
            }
            
            // Count classes
            if (trimmed.match(/^class\s+\w+/)) {
                metrics.classes++;
            }
            
            // Count imports
            if (trimmed.match(/^import\s+|^const\s+.*=\s*require\(/)) {
                metrics.imports++;
            }
            
            // Count exports
            if (trimmed.match(/^export\s+|^module\.exports\s*=/)) {
                metrics.exports++;
            }
            
            // Count comments
            if (trimmed.match(/^\/\/|^\/\*|\*\//)) {
                metrics.comments++;
            }
            
            // Basic complexity indicators
            if (trimmed.match(/if\s*\(|for\s*\(|while\s*\(|switch\s*\(/)) {
                metrics.complexity++;
            }
        }

        return metrics;
    }

    shouldExclude(relativePath, name) {
        return this.config.excludePatterns.some(pattern => {
            if (pattern.includes('*')) {
                // Simple glob pattern matching
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(name) || regex.test(relativePath);
            }
            return name === pattern || relativePath.includes(pattern);
        });
    }

    isCodeFile(extension) {
        return this.config.includeExtensions.includes(extension);
    }

    categorizeFile(node) {
        const ext = node.extension;
        const name = node.name.toLowerCase();

        if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c'].includes(ext)) {
            return 'code';
        }
        
        if (['.json', '.yml', '.yaml', '.xml', '.config', '.env'].includes(ext) || 
            name.includes('config') || name.includes('setting')) {
            return 'config';
        }
        
        if (['.md', '.txt', '.rst', '.doc'].includes(ext) || 
            name.includes('readme') || name.includes('doc')) {
            return 'documentation';
        }
        
        if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.css', '.scss', '.less'].includes(ext)) {
            return 'assets';
        }
        
        return 'other';
    }

    async findImports(node, importedModules) {
        if (!node) return;

        if (node.type === 'file' && node.isCode && !node.error) {
            try {
                const content = await fs.readFile(node.absolutePath, 'utf8');
                const imports = this.extractImports(content);
                imports.forEach(imp => importedModules.add(imp));
            } catch (error) {
                // Ignore file read errors
            }
        } else if (node.type === 'directory' && node.children) {
            for (const child of node.children) {
                await this.findImports(child, importedModules);
            }
        }
    }

    extractImports(content) {
        const imports = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // ES6 imports
            const es6Match = trimmed.match(/^import\s+.*?from\s+['"`]([^'"`]+)['"`]/);
            if (es6Match) {
                imports.push(this.normalizeModuleName(es6Match[1]));
            }
            
            // CommonJS requires
            const cjsMatch = trimmed.match(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
            if (cjsMatch) {
                imports.push(this.normalizeModuleName(cjsMatch[1]));
            }
        }
        
        return imports;
    }

    normalizeModuleName(moduleName) {
        // Extract package name from scoped packages or sub-paths
        if (moduleName.startsWith('@')) {
            const parts = moduleName.split('/');
            return parts.slice(0, 2).join('/');
        }
        
        if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
            return null; // Relative imports
        }
        
        return moduleName.split('/')[0];
    }

    isBuiltinModule(moduleName) {
        const builtins = [
            'fs', 'path', 'http', 'https', 'url', 'querystring', 'crypto',
            'events', 'stream', 'util', 'os', 'child_process', 'cluster',
            'dgram', 'dns', 'net', 'tls', 'readline', 'repl', 'vm'
        ];
        return builtins.includes(moduleName);
    }

    detectArchitecturalPatterns(fileTree) {
        const patterns = [];
        
        if (this.hasDirectory(fileTree, 'controllers') && 
            this.hasDirectory(fileTree, 'models') && 
            this.hasDirectory(fileTree, 'views')) {
            patterns.push('MVC');
        }
        
        if (this.hasDirectory(fileTree, 'components') && 
            this.hasDirectory(fileTree, 'services')) {
            patterns.push('Component-Service');
        }
        
        if (this.hasDirectory(fileTree, 'src') && 
            this.hasDirectory(fileTree, 'test')) {
            patterns.push('Standard Node.js');
        }
        
        return patterns;
    }

    detectFrameworks(fileTree) {
        const frameworks = [];
        
        if (this.hasFile(fileTree, 'package.json')) {
            // Would need to read package.json to detect frameworks
            // This is a simplified version
        }
        
        return frameworks;
    }

    detectBuildTools(fileTree) {
        const tools = [];
        
        if (this.hasFile(fileTree, 'webpack.config.js')) tools.push('Webpack');
        if (this.hasFile(fileTree, 'rollup.config.js')) tools.push('Rollup');
        if (this.hasFile(fileTree, 'vite.config.js')) tools.push('Vite');
        if (this.hasFile(fileTree, 'gulpfile.js')) tools.push('Gulp');
        if (this.hasFile(fileTree, 'Gruntfile.js')) tools.push('Grunt');
        
        return tools;
    }

    detectTestFrameworks(fileTree) {
        const frameworks = [];
        
        if (this.hasFile(fileTree, 'jest.config.js') || 
            this.hasDirectory(fileTree, '__tests__')) {
            frameworks.push('Jest');
        }
        
        if (this.hasFile(fileTree, 'mocha.opts') || 
            this.hasFile(fileTree, '.mocharc.json')) {
            frameworks.push('Mocha');
        }
        
        return frameworks;
    }

    analyzeNamingPatterns(fileTree) {
        const patterns = {
            camelCase: 0,
            kebabCase: 0,
            snakeCase: 0,
            pascalCase: 0
        };
        
        const analyzeNode = (node) => {
            if (node.type === 'file') {
                const name = node.name.replace(/\.[^.]*$/, ''); // Remove extension
                
                if (/^[a-z][a-zA-Z0-9]*$/.test(name)) patterns.camelCase++;
                else if (/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name)) patterns.kebabCase++;
                else if (/^[a-z][a-z0-9_]*[a-z0-9]$/.test(name)) patterns.snakeCase++;
                else if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) patterns.pascalCase++;
            }
            
            if (node.children) {
                node.children.forEach(analyzeNode);
            }
        };
        
        if (fileTree) analyzeNode(fileTree);
        return patterns;
    }

    analyzeOrganizationPatterns(fileTree) {
        const patterns = {
            maxDepth: 0,
            avgFilesPerDirectory: 0,
            directoryTypes: {}
        };
        
        const analyzeDepth = (node, depth = 0) => {
            patterns.maxDepth = Math.max(patterns.maxDepth, depth);
            
            if (node.children) {
                node.children.forEach(child => analyzeDepth(child, depth + 1));
            }
        };
        
        if (fileTree) analyzeDepth(fileTree);
        return patterns;
    }

    hasDirectory(fileTree, name) {
        const search = (node) => {
            if (node.type === 'directory' && node.name === name) {
                return true;
            }
            if (node.children) {
                return node.children.some(search);
            }
            return false;
        };
        
        return fileTree ? search(fileTree) : false;
    }

    hasFile(fileTree, name) {
        const search = (node) => {
            if (node.type === 'file' && node.name === name) {
                return true;
            }
            if (node.children) {
                return node.children.some(search);
            }
            return false;
        };
        
        return fileTree ? search(fileTree) : false;
    }

    // Query methods
    async searchFiles(query, options = {}) {
        if (!this.cache.fileTree) {
            await this.analyzeCodebase();
        }

        const results = [];
        const searchNode = (node) => {
            if (node.type === 'file') {
                const searchIn = [node.name, node.path].join(' ').toLowerCase();
                if (searchIn.includes(query.toLowerCase())) {
                    results.push(node);
                }
            }
            
            if (node.children) {
                node.children.forEach(searchNode);
            }
        };

        if (this.cache.fileTree) {
            searchNode(this.cache.fileTree);
        }

        return results.slice(0, options.limit || 100);
    }

    getMetrics() {
        return this.cache.metrics;
    }

    getDependencies() {
        return this.cache.dependencies;
    }

    getFileTree() {
        return this.cache.fileTree;
    }

    clearCache() {
        this.cache = {
            fileTree: null,
            metrics: null,
            dependencies: null,
            lastScan: null
        };
    }
}

module.exports = CodebaseAnalyzer;