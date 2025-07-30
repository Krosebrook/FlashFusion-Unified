#!/usr/bin/env node

/**
 * FlashFusion Unified Platform Setup Script
 * Interactive setup wizard for new installations
 */

const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const figlet = require('figlet');

class FlashFusionSetup {
    constructor() {
        this.config = {};
        this.envPath = path.join(process.cwd(), '.env');
    }

    async run() {
        console.clear();
        this.showWelcome();
        
        await this.gatherConfiguration();
        await this.createEnvironmentFile();
        await this.setupDirectories();
        await this.showCompletion();
    }

    showWelcome() {
        console.log(chalk.cyan(figlet.textSync('FlashFusion', { horizontalLayout: 'fitted' })));
        console.log(chalk.cyan('✨ Unified AI Business Operating System\n'));
        console.log(chalk.white('Welcome to FlashFusion! Let\'s set up your AI-powered business automation platform.\n'));
    }

    async gatherConfiguration() {
        console.log(chalk.yellow('📋 Configuration Setup\n'));

        // Basic platform configuration
        const basicConfig = await inquirer.prompt([
            {
                type: 'input',
                name: 'APP_NAME',
                message: 'What would you like to name your FlashFusion instance?',
                default: 'FlashFusion Unified'
            },
            {
                type: 'input',
                name: 'PORT',
                message: 'Which port should the server run on?',
                default: '3000',
                validate: (input) => {
                    const port = parseInt(input);
                    return (port > 0 && port < 65536) || 'Please enter a valid port number';
                }
            },
            {
                type: 'list',
                name: 'NODE_ENV',
                message: 'What environment are you setting up?',
                choices: ['development', 'production', 'staging'],
                default: 'development'
            }
        ]);

        this.config = { ...this.config, ...basicConfig };

        // AI Services configuration
        console.log(chalk.yellow('\n🤖 AI Services Configuration\n'));
        
        const aiConfig = await inquirer.prompt([
            {
                type: 'password',
                name: 'OPENAI_API_KEY',
                message: 'Enter your OpenAI API key (optional):',
                mask: '*'
            },
            {
                type: 'password',
                name: 'ANTHROPIC_API_KEY', 
                message: 'Enter your Anthropic/Claude API key (optional):',
                mask: '*'
            },
            {
                type: 'password',
                name: 'GEMINI_API_KEY',
                message: 'Enter your Google Gemini API key (optional):',
                mask: '*'
            }
        ]);

        this.config = { ...this.config, ...aiConfig };

        // Database configuration
        console.log(chalk.yellow('\n💾 Database Configuration\n'));
        
        const dbConfig = await inquirer.prompt([
            {
                type: 'input',
                name: 'SUPABASE_URL',
                message: 'Enter your Supabase project URL (optional):'
            },
            {
                type: 'password',
                name: 'SUPABASE_ANON_KEY',
                message: 'Enter your Supabase anon key (optional):',
                mask: '*'
            },
            {
                type: 'input',
                name: 'REDIS_URL',
                message: 'Enter your Redis URL:',
                default: 'redis://localhost:6379'
            }
        ]);

        this.config = { ...this.config, ...dbConfig };

        // Workflow preferences
        console.log(chalk.yellow('\n🔧 Workflow Configuration\n'));
        
        const workflowConfig = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'ENABLED_WORKFLOWS',
                message: 'Which workflows would you like to enable?',
                choices: [
                    { name: 'Development Workflow (Build AI products)', value: 'development', checked: true },
                    { name: 'Commerce Workflow (E-commerce automation)', value: 'commerce', checked: true },
                    { name: 'Content Workflow (Content creation & distribution)', value: 'content', checked: true },
                    { name: 'Hybrid Workflow (Cross-workflow orchestration)', value: 'hybrid', checked: true }
                ]
            },
            {
                type: 'confirm',
                name: 'ENABLE_WEB_SCRAPING',
                message: 'Enable web scraping capabilities?',
                default: true
            }
        ]);

        this.config = { ...this.config, ...workflowConfig };

        // Security configuration
        console.log(chalk.yellow('\n🔒 Security Configuration\n'));
        
        const securityConfig = await inquirer.prompt([
            {
                type: 'password',
                name: 'JWT_SECRET',
                message: 'Enter a JWT secret key (will generate if empty):',
                mask: '*'
            },
            {
                type: 'input',
                name: 'API_RATE_LIMIT_MAX_REQUESTS',
                message: 'API rate limit (requests per 15 minutes):',
                default: '100'
            }
        ]);

        // Generate JWT secret if not provided
        if (!securityConfig.JWT_SECRET) {
            securityConfig.JWT_SECRET = require('crypto').randomBytes(64).toString('hex');
        }

        this.config = { ...this.config, ...securityConfig };

        // Optional integrations
        const enableIntegrations = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'SETUP_INTEGRATIONS',
                message: 'Would you like to configure integrations now?',
                default: false
            }
        ]);

        if (enableIntegrations.SETUP_INTEGRATIONS) {
            await this.setupIntegrations();
        }
    }

    async setupIntegrations() {
        console.log(chalk.yellow('\n🔌 Integration Setup\n'));

        const integrationChoices = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'INTEGRATIONS',
                message: 'Which integrations would you like to configure?',
                choices: [
                    { name: 'GitHub (Development workflow)', value: 'github' },
                    { name: 'Shopify (Commerce workflow)', value: 'shopify' },
                    { name: 'YouTube (Content workflow)', value: 'youtube' },
                    { name: 'Stripe (Payment processing)', value: 'stripe' },
                    { name: 'SendGrid (Email notifications)', value: 'sendgrid' }
                ]
            }
        ]);

        for (const integration of integrationChoices.INTEGRATIONS) {
            await this.configureIntegration(integration);
        }
    }

    async configureIntegration(integration) {
        console.log(chalk.blue(`\n🔧 Configuring ${integration.toUpperCase()}...\n`));

        switch (integration) {
            case 'github':
                const githubConfig = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'GITHUB_TOKEN',
                        message: 'Enter your GitHub personal access token:',
                        mask: '*'
                    }
                ]);
                this.config = { ...this.config, ...githubConfig };
                break;

            case 'shopify':
                const shopifyConfig = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'SHOPIFY_API_KEY',
                        message: 'Enter your Shopify API key:'
                    },
                    {
                        type: 'password',
                        name: 'SHOPIFY_API_SECRET',
                        message: 'Enter your Shopify API secret:',
                        mask: '*'
                    }
                ]);
                this.config = { ...this.config, ...shopifyConfig };
                break;

            case 'youtube':
                const youtubeConfig = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'YOUTUBE_API_KEY',
                        message: 'Enter your YouTube API key:',
                        mask: '*'
                    }
                ]);
                this.config = { ...this.config, ...youtubeConfig };
                break;

            case 'stripe':
                const stripeConfig = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'STRIPE_SECRET_KEY',
                        message: 'Enter your Stripe secret key:',
                        mask: '*'
                    }
                ]);
                this.config = { ...this.config, ...stripeConfig };
                break;

            case 'sendgrid':
                const sendgridConfig = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'SENDGRID_API_KEY',
                        message: 'Enter your SendGrid API key:',
                        mask: '*'
                    },
                    {
                        type: 'input',
                        name: 'SENDGRID_FROM_EMAIL',
                        message: 'Enter your from email address:',
                        validate: (input) => {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            return emailRegex.test(input) || 'Please enter a valid email address';
                        }
                    }
                ]);
                this.config = { ...this.config, ...sendgridConfig };
                break;
        }
    }

    async createEnvironmentFile() {
        const spinner = ora('Creating environment configuration...').start();
        
        try {
            // Read the example env file
            const exampleEnvPath = path.join(process.cwd(), '.env.example');
            let envContent = await fs.readFile(exampleEnvPath, 'utf-8');

            // Replace placeholder values with user configuration
            for (const [key, value] of Object.entries(this.config)) {
                if (value && value !== '') {
                    const regex = new RegExp(`${key}=.*`, 'g');
                    envContent = envContent.replace(regex, `${key}=${value}`);
                }
            }

            // Write the new .env file
            await fs.writeFile(this.envPath, envContent);
            
            spinner.succeed('Environment configuration created');
        } catch (error) {
            spinner.fail('Failed to create environment configuration');
            console.error(chalk.red('Error:'), error.message);
            process.exit(1);
        }
    }

    async setupDirectories() {
        const spinner = ora('Setting up directory structure...').start();
        
        try {
            const directories = [
                'logs',
                'temp',
                'uploads',
                'backups',
                'workflows/templates',
                'agents/custom',
                'data/exports'
            ];

            for (const dir of directories) {
                const dirPath = path.join(process.cwd(), dir);
                await fs.mkdir(dirPath, { recursive: true });
            }

            // Create a basic .gitkeep file in empty directories
            for (const dir of directories) {
                const gitkeepPath = path.join(process.cwd(), dir, '.gitkeep');
                try {
                    await fs.access(gitkeepPath);
                } catch {
                    await fs.writeFile(gitkeepPath, '');
                }
            }

            spinner.succeed('Directory structure created');
        } catch (error) {
            spinner.fail('Failed to create directories');
            console.error(chalk.red('Error:'), error.message);
        }
    }

    showCompletion() {
        console.log(chalk.green('\n🎉 FlashFusion Setup Complete!\n'));
        
        console.log(chalk.white('Next steps:'));
        console.log(chalk.gray('1. Install dependencies: ') + chalk.cyan('npm install'));
        console.log(chalk.gray('2. Start development server: ') + chalk.cyan('npm run dev'));
        console.log(chalk.gray('3. Open dashboard: ') + chalk.cyan(`http://localhost:${this.config.PORT || 3000}`));
        
        console.log(chalk.white('\nUseful commands:'));
        console.log(chalk.gray('• Check system health: ') + chalk.cyan('npm run health'));
        console.log(chalk.gray('• Run tests: ') + chalk.cyan('npm test'));
        console.log(chalk.gray('• View documentation: ') + chalk.cyan('npm run docs'));
        
        if (Object.keys(this.config).some(key => key.includes('API_KEY'))) {
            console.log(chalk.yellow('\n⚠️  Remember to keep your API keys secure and never commit them to version control!'));
        }
        
        console.log(chalk.cyan('\n🚀 Welcome to the future of AI-powered business automation!'));
    }
}

// Run setup if called directly
if (require.main === module) {
    const setup = new FlashFusionSetup();
    setup.run().catch(error => {
        console.error(chalk.red('\n❌ Setup failed:'), error.message);
        process.exit(1);
    });
}

module.exports = FlashFusionSetup;