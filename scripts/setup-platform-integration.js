#!/usr/bin/env node

/**
 * FlashFusion Platform Integration Setup Script
 * Interactive setup for connecting all platforms
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');

class PlatformIntegrationSetup {
    constructor() {
        this.envPath = path.join(process.cwd(), '.env');
        this.templatePath = path.join(process.cwd(), '.env.platform-integration.template');
        this.config = {};
    }

    async run() {
        console.clear();
        
        // Display banner
        console.log(chalk.cyan(figlet.textSync('FlashFusion', { font: 'Small' })));
        console.log(chalk.yellow('Platform Integration Pipeline Setup\n'));
        
        try {
            await this.checkPrerequisites();
            await this.loadExistingConfig();
            await this.runSetupWizard();
            await this.generateConfig();
            await this.testConnections();
            this.displayCompletionMessage();
        } catch (error) {
            console.error(chalk.red('Setup failed:'), error.message);
            process.exit(1);
        }
    }

    async checkPrerequisites() {
        console.log(chalk.blue('🔍 Checking prerequisites...\n'));
        
        // Check if template exists
        if (!fs.existsSync(this.templatePath)) {
            throw new Error('Environment template not found. Please ensure .env.platform-integration.template exists.');
        }
        
        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        if (majorVersion < 18) {
            console.log(chalk.yellow(`⚠️  Node.js ${nodeVersion} detected. Node.js 18+ recommended.`));
        } else {
            console.log(chalk.green(`✅ Node.js ${nodeVersion} - Good!`));
        }
        
        // Check if required packages are installed
        const requiredPackages = ['express', 'axios', 'dotenv'];
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        for (const pkg of requiredPackages) {
            if (dependencies[pkg]) {
                console.log(chalk.green(`✅ ${pkg} - Installed`));
            } else {
                console.log(chalk.red(`❌ ${pkg} - Missing`));
                throw new Error(`Required package ${pkg} is not installed. Run 'npm install' first.`);
            }
        }
        
        console.log();
    }

    async loadExistingConfig() {
        if (fs.existsSync(this.envPath)) {
            console.log(chalk.blue('📄 Loading existing configuration...\n'));
            
            const envContent = fs.readFileSync(this.envPath, 'utf8');
            const lines = envContent.split('\n');
            
            for (const line of lines) {
                const [key, value] = line.split('=');
                if (key && value && !key.startsWith('#')) {
                    this.config[key.trim()] = value.trim();
                }
            }
            
            console.log(chalk.green(`✅ Loaded ${Object.keys(this.config).length} existing settings\n`));
        }
    }

    async runSetupWizard() {
        console.log(chalk.blue('🧙 Platform Integration Setup Wizard\n'));
        
        // Basic configuration
        await this.setupBasicConfig();
        
        // Platform selection
        await this.selectPlatforms();
        
        // Configure selected platforms
        await this.configurePlatforms();
        
        // Advanced settings
        await this.setupAdvancedConfig();
    }

    async setupBasicConfig() {
        console.log(chalk.yellow('📋 Basic Configuration\n'));
        
        const basicQuestions = [
            {
                type: 'input',
                name: 'PORT',
                message: 'Server port:',
                default: this.config.PORT || '3000',
                validate: (value) => {
                    const port = parseInt(value);
                    return (port > 0 && port < 65536) ? true : 'Please enter a valid port number (1-65535)';
                }
            },
            {
                type: 'list',
                name: 'NODE_ENV',
                message: 'Environment:',
                choices: ['development', 'staging', 'production'],
                default: this.config.NODE_ENV || 'development'
            },
            {
                type: 'input',
                name: 'WEBHOOK_SECRET',
                message: 'Webhook secret (leave empty to generate):',
                default: this.config.WEBHOOK_SECRET || '',
                filter: (value) => value || crypto.randomBytes(32).toString('hex')
            }
        ];
        
        const answers = await inquirer.prompt(basicQuestions);
        Object.assign(this.config, answers);
    }

    async selectPlatforms() {
        console.log(chalk.yellow('\n🔌 Platform Selection\n'));
        
        const platformChoices = [
            { name: '🤖 ChatGPT / OpenAI', value: 'openai', checked: !!this.config.OPENAI_API_KEY },
            { name: '🧠 Claude AI / Anthropic', value: 'anthropic', checked: !!this.config.ANTHROPIC_API_KEY },
            { name: '💻 Cursor IDE', value: 'cursor', checked: !!this.config.CURSOR_API_KEY },
            { name: '📝 Notion', value: 'notion', checked: !!this.config.NOTION_TOKEN },
            { name: '🐙 GitHub', value: 'github', checked: !!this.config.GITHUB_TOKEN },
            { name: '⚡ Zapier', value: 'zapier', checked: !!this.config.ZAPIER_API_KEY },
            { name: '🚀 Vercel', value: 'vercel', checked: !!this.config.VERCEL_TOKEN },
            { name: '🐳 Docker Hub', value: 'docker', checked: !!(this.config.DOCKER_USERNAME && this.config.DOCKER_PASSWORD) },
            { name: '🎧 Zendesk', value: 'zendesk', checked: !!this.config.ZENDESK_TOKEN },
            { name: '🔥 Firebase', value: 'firebase', checked: !!this.config.FIREBASE_PROJECT_ID },
            { name: '🗄️ Supabase', value: 'supabase', checked: !!this.config.SUPABASE_URL },
            { name: '🔧 Replit', value: 'replit', checked: !!this.config.REPLIT_API_TOKEN },
            { name: '💖 Loveable.dev', value: 'loveable', checked: !!this.config.LOVEABLE_API_KEY },
            { name: '📦 Base44', value: 'base44', checked: !!this.config.BASE44_API_KEY },
            { name: '🛡️ Trilio', value: 'trilio', checked: !!this.config.TRILIO_API_KEY }
        ];
        
        const { selectedPlatforms } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedPlatforms',
                message: 'Select platforms to configure:',
                choices: platformChoices,
                validate: (answer) => answer.length > 0 ? true : 'Please select at least one platform'
            }
        ]);
        
        this.selectedPlatforms = selectedPlatforms;
    }

    async configurePlatforms() {
        console.log(chalk.yellow('\n⚙️ Platform Configuration\n'));
        
        for (const platform of this.selectedPlatforms) {
            await this.configurePlatform(platform);
        }
    }

    async configurePlatform(platform) {
        console.log(chalk.cyan(`\n📋 Configuring ${platform.toUpperCase()}\n`));
        
        const platformConfigs = {
            openai: [
                {
                    type: 'input',
                    name: 'OPENAI_API_KEY',
                    message: 'OpenAI API Key:',
                    default: this.config.OPENAI_API_KEY || '',
                    validate: (value) => value.startsWith('sk-') ? true : 'OpenAI API key should start with "sk-"'
                },
                {
                    type: 'input',
                    name: 'CHATGPT_WEBHOOK_URL',
                    message: 'ChatGPT Webhook URL (optional):',
                    default: this.config.CHATGPT_WEBHOOK_URL || ''
                }
            ],
            anthropic: [
                {
                    type: 'input',
                    name: 'ANTHROPIC_API_KEY',
                    message: 'Anthropic API Key:',
                    default: this.config.ANTHROPIC_API_KEY || '',
                    validate: (value) => value.startsWith('sk-ant-') ? true : 'Anthropic API key should start with "sk-ant-"'
                },
                {
                    type: 'input',
                    name: 'CLAUDE_WEBHOOK_URL',
                    message: 'Claude Webhook URL (optional):',
                    default: this.config.CLAUDE_WEBHOOK_URL || ''
                }
            ],
            github: [
                {
                    type: 'input',
                    name: 'GITHUB_TOKEN',
                    message: 'GitHub Personal Access Token:',
                    default: this.config.GITHUB_TOKEN || '',
                    validate: (value) => value.startsWith('ghp_') || value.startsWith('github_pat_') ? true : 'Invalid GitHub token format'
                },
                {
                    type: 'input',
                    name: 'GITHUB_WEBHOOK_URL',
                    message: 'GitHub Webhook URL (optional):',
                    default: this.config.GITHUB_WEBHOOK_URL || ''
                }
            ],
            notion: [
                {
                    type: 'input',
                    name: 'NOTION_TOKEN',
                    message: 'Notion Integration Token:',
                    default: this.config.NOTION_TOKEN || '',
                    validate: (value) => value.startsWith('secret_') ? true : 'Notion token should start with "secret_"'
                },
                {
                    type: 'input',
                    name: 'NOTION_WEBHOOK_URL',
                    message: 'Notion Webhook URL (optional):',
                    default: this.config.NOTION_WEBHOOK_URL || ''
                }
            ],
            zapier: [
                {
                    type: 'input',
                    name: 'ZAPIER_API_KEY',
                    message: 'Zapier API Key:',
                    default: this.config.ZAPIER_API_KEY || ''
                },
                {
                    type: 'input',
                    name: 'ZAPIER_WEBHOOK_URL',
                    message: 'Main Zapier Webhook URL:',
                    default: this.config.ZAPIER_WEBHOOK_URL || '',
                    validate: (value) => value.includes('hooks.zapier.com') ? true : 'Please enter a valid Zapier webhook URL'
                }
            ],
            firebase: [
                {
                    type: 'input',
                    name: 'FIREBASE_PROJECT_ID',
                    message: 'Firebase Project ID:',
                    default: this.config.FIREBASE_PROJECT_ID || ''
                },
                {
                    type: 'input',
                    name: 'FIREBASE_SERVICE_ACCOUNT',
                    message: 'Firebase Service Account JSON path:',
                    default: this.config.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json'
                }
            ],
            supabase: [
                {
                    type: 'input',
                    name: 'SUPABASE_URL',
                    message: 'Supabase Project URL:',
                    default: this.config.SUPABASE_URL || '',
                    validate: (value) => value.includes('supabase.co') ? true : 'Please enter a valid Supabase URL'
                },
                {
                    type: 'input',
                    name: 'SUPABASE_SERVICE_ROLE_KEY',
                    message: 'Supabase Service Role Key:',
                    default: this.config.SUPABASE_SERVICE_ROLE_KEY || ''
                }
            ]
        };
        
        const questions = platformConfigs[platform] || [
            {
                type: 'input',
                name: `${platform.toUpperCase()}_API_KEY`,
                message: `${platform} API Key:`,
                default: this.config[`${platform.toUpperCase()}_API_KEY`] || ''
            }
        ];
        
        const answers = await inquirer.prompt(questions);
        Object.assign(this.config, answers);
    }

    async setupAdvancedConfig() {
        console.log(chalk.yellow('\n🔧 Advanced Configuration\n'));
        
        const { configureAdvanced } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'configureAdvanced',
                message: 'Configure advanced settings?',
                default: false
            }
        ]);
        
        if (configureAdvanced) {
            const advancedQuestions = [
                {
                    type: 'input',
                    name: 'RATE_LIMIT_MAX_REQUESTS',
                    message: 'Rate limit (requests per window):',
                    default: this.config.RATE_LIMIT_MAX_REQUESTS || '100'
                },
                {
                    type: 'input',
                    name: 'EVENT_QUEUE_MAX_SIZE',
                    message: 'Event queue max size:',
                    default: this.config.EVENT_QUEUE_MAX_SIZE || '1000'
                },
                {
                    type: 'list',
                    name: 'LOG_LEVEL',
                    message: 'Log level:',
                    choices: ['error', 'warn', 'info', 'debug'],
                    default: this.config.LOG_LEVEL || 'info'
                }
            ];
            
            const answers = await inquirer.prompt(advancedQuestions);
            Object.assign(this.config, answers);
        }
    }

    async generateConfig() {
        console.log(chalk.blue('\n📝 Generating configuration file...\n'));
        
        // Read template
        const template = fs.readFileSync(this.templatePath, 'utf8');
        let envContent = template;
        
        // Replace placeholders with actual values
        for (const [key, value] of Object.entries(this.config)) {
            const placeholder = new RegExp(`${key}=.*`, 'g');
            envContent = envContent.replace(placeholder, `${key}=${value}`);
        }
        
        // Backup existing .env if it exists
        if (fs.existsSync(this.envPath)) {
            const backupPath = `${this.envPath}.backup.${Date.now()}`;
            fs.copyFileSync(this.envPath, backupPath);
            console.log(chalk.yellow(`📋 Backed up existing .env to ${path.basename(backupPath)}`));
        }
        
        // Write new .env file
        fs.writeFileSync(this.envPath, envContent);
        console.log(chalk.green('✅ Configuration file generated successfully!'));
    }

    async testConnections() {
        console.log(chalk.blue('\n🧪 Testing platform connections...\n'));
        
        const { runTests } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'runTests',
                message: 'Test platform connections now?',
                default: true
            }
        ]);
        
        if (runTests) {
            // Start the server temporarily for testing
            console.log(chalk.yellow('🚀 Starting test server...'));
            
            try {
                const { spawn } = require('child_process');
                const server = spawn('node', ['src/index.js'], {
                    env: { ...process.env, ...this.config },
                    stdio: 'pipe'
                });
                
                // Wait for server to start
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Test connections
                const axios = require('axios');
                try {
                    const response = await axios.get('http://localhost:3000/api/webhooks/status');
                    const status = response.data;
                    
                    console.log(chalk.green('\n✅ Platform Status:'));
                    for (const [platform, config] of Object.entries(status.platforms)) {
                        const statusIcon = config.enabled ? '🟢' : '🔴';
                        console.log(`${statusIcon} ${platform}: ${config.enabled ? 'Enabled' : 'Disabled'}`);
                    }
                } catch (error) {
                    console.log(chalk.red('❌ Failed to test connections:', error.message));
                }
                
                // Stop test server
                server.kill();
                console.log(chalk.yellow('\n🛑 Test server stopped'));
                
            } catch (error) {
                console.log(chalk.red('❌ Failed to start test server:', error.message));
            }
        }
    }

    displayCompletionMessage() {
        console.log(chalk.green('\n🎉 Platform Integration Setup Complete!\n'));
        
        console.log(chalk.cyan('Next Steps:'));
        console.log('1. Start the platform integration pipeline:');
        console.log(chalk.white('   npm run platform:start'));
        console.log('\n2. Access the dashboard:');
        console.log(chalk.white('   http://localhost:3000/platform-dashboard'));
        console.log('\n3. Set up webhooks in your platforms pointing to:');
        console.log(chalk.white('   https://your-domain.com/api/webhooks/{platform}'));
        console.log('\n4. Create Zapier automations using the webhook URLs');
        console.log('\n5. Monitor and test your integrations in the dashboard');
        
        console.log(chalk.yellow('\n📚 Documentation:'));
        console.log('   See PLATFORM_INTEGRATION_GUIDE.md for detailed setup instructions');
        
        console.log(chalk.green('\n✨ Your platforms are now ready to work together!'));
    }
}

// Run the setup if this file is executed directly
if (require.main === module) {
    const setup = new PlatformIntegrationSetup();
    setup.run().catch(error => {
        console.error(chalk.red('Setup failed:'), error);
        process.exit(1);
    });
}

module.exports = PlatformIntegrationSetup;