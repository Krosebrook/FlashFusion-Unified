#!/usr/bin/env node
/**
 * Replit Environment Setup Script
 * Automates the configuration of environment variables and secrets
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ReplitEnvSetup {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.envVars = {};
        this.secretsFile = '.replit-secrets.json';
        this.envTemplate = path.join(__dirname, '..', '.env.template');
    }

    async setupEnvironment() {
        console.log('🔧 FlashFusion Replit Environment Setup\n');
        
        try {
            await this.detectEnvironment();
            await this.collectEnvironmentVariables();
            await this.generateFiles();
            await this.displayInstructions();
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async detectEnvironment() {
        console.log('🔍 Detecting environment...');
        
        // Check if running in Replit
        const isReplit = process.env.REPL_ID || process.env.REPLIT_DB_URL;
        
        if (isReplit) {
            console.log('✅ Replit environment detected');
            this.isReplit = true;
        } else {
            console.log('📍 Local development environment detected');
            this.isReplit = false;
        }
    }

    async collectEnvironmentVariables() {
        console.log('\n📝 Setting up environment variables...\n');

        const requiredVars = [
            {
                key: 'NODE_ENV',
                description: 'Node.js environment',
                default: 'development',
                required: true
            },
            {
                key: 'PORT',
                description: 'Application port',
                default: '3333',
                required: true
            },
            {
                key: 'SUPABASE_URL',
                description: 'Supabase project URL',
                required: true,
                secret: true
            },
            {
                key: 'SUPABASE_ANON_KEY',
                description: 'Supabase anonymous key',
                required: true,
                secret: true
            },
            {
                key: 'ANTHROPIC_API_KEY',
                description: 'Anthropic Claude API key',
                required: true,
                secret: true
            },
            {
                key: 'OPENAI_API_KEY',
                description: 'OpenAI API key',
                required: false,
                secret: true
            },
            {
                key: 'JWT_SECRET',
                description: 'JWT secret for authentication',
                required: true,
                secret: true,
                generate: true
            },
            {
                key: 'NOTION_API_KEY',
                description: 'Notion integration key',
                required: false,
                secret: true
            },
            {
                key: 'ZAPIER_WEBHOOK_URL',
                description: 'Zapier webhook URL',
                required: false,
                secret: true
            }
        ];

        for (const varConfig of requiredVars) {
            await this.collectVariable(varConfig);
        }
    }

    async collectVariable(config) {
        const { key, description, default: defaultValue, required, secret, generate } = config;
        
        let value = '';
        
        if (generate && key === 'JWT_SECRET') {
            value = this.generateJWTSecret();
            console.log(`🔐 Generated ${key}: ${value.substring(0, 10)}...`);
        } else {
            const prompt = `${description} (${key})${defaultValue ? ` [${defaultValue}]` : ''}${required ? ' *' : ''}: `;
            value = await this.question(prompt);
            
            if (!value && defaultValue) {
                value = defaultValue;
            }
            
            if (!value && required) {
                console.log(`❌ ${key} is required!`);
                return await this.collectVariable(config);
            }
        }
        
        if (value) {
            this.envVars[key] = {
                value,
                secret: secret || false,
                description
            };
        }
    }

    generateJWTSecret() {
        const crypto = require('crypto');
        return crypto.randomBytes(64).toString('hex');
    }

    async generateFiles() {
        console.log('\n📄 Generating configuration files...\n');

        // Generate .env.template
        await this.generateEnvTemplate();
        
        // Generate Replit secrets guide
        await this.generateReplitSecretsGuide();
        
        // Generate .env file for local development
        if (!this.isReplit) {
            await this.generateLocalEnvFile();
        }
        
        console.log('✅ Configuration files generated successfully!');
    }

    async generateEnvTemplate() {
        const templateContent = [
            '# FlashFusion Environment Variables Template',
            '# Copy this file to .env and fill in your actual values',
            '',
            '# Core Application',
            'NODE_ENV=development',
            'PORT=3333',
            '',
            '# Database Configuration',
            'SUPABASE_URL=your_supabase_project_url',
            'SUPABASE_ANON_KEY=your_supabase_anon_key',
            'POSTGRES_URL=postgresql://user:password@localhost:5432/flashfusion',
            '',
            '# AI Services',
            'ANTHROPIC_API_KEY=sk-ant-your-anthropic-key',
            'OPENAI_API_KEY=sk-your-openai-key',
            'GEMINI_API_KEY=your-gemini-key',
            '',
            '# Security',
            'JWT_SECRET=your-super-secure-jwt-secret-key',
            '',
            '# External Integrations',
            'NOTION_API_KEY=secret_your-notion-integration-key',
            'ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook',
            '',
            '# Optional Services',
            'PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1',
            'VERCEL_TOKEN=your_vercel_token',
            'GITHUB_TOKEN=your_github_personal_access_token'
        ];

        fs.writeFileSync('.env.template', templateContent.join('\n'));
        console.log('📝 Created .env.template');
    }

    async generateReplitSecretsGuide() {
        const secrets = Object.entries(this.envVars)
            .filter(([_, config]) => config.secret)
            .map(([key, config]) => ({
                key,
                value: config.value,
                description: config.description
            }));

        const guide = {
            instructions: "Add these secrets in Replit's Secrets tab (🔒)",
            secrets: secrets,
            steps: [
                "1. Open your Repl in Replit",
                "2. Click the '🔒 Secrets' tab in the left sidebar",
                "3. For each secret below, click 'New Secret'",
                "4. Enter the key name and value",
                "5. Click 'Add Secret'",
                "6. Restart your Repl after adding all secrets"
            ]
        };

        fs.writeFileSync('replit-secrets-guide.json', JSON.stringify(guide, null, 2));
        console.log('🔐 Created replit-secrets-guide.json');
        
        // Also create a markdown version for easy reading
        const markdownGuide = [
            '# Replit Secrets Configuration',
            '',
            '## Instructions',
            '1. Open your Repl in Replit',
            '2. Click the "🔒 Secrets" tab in the left sidebar',
            '3. For each secret below, click "New Secret"',
            '4. Enter the key name and value exactly as shown',
            '5. Click "Add Secret"',
            '6. Restart your Repl after adding all secrets',
            '',
            '## Required Secrets',
            ''
        ];

        secrets.forEach(secret => {
            markdownGuide.push(`### ${secret.key}`);
            markdownGuide.push(`**Description:** ${secret.description}`);
            markdownGuide.push(`**Value:** \`${secret.value}\``);
            markdownGuide.push('');
        });

        fs.writeFileSync('REPLIT_SECRETS.md', markdownGuide.join('\n'));
        console.log('📋 Created REPLIT_SECRETS.md');
    }

    async generateLocalEnvFile() {
        const envContent = Object.entries(this.envVars)
            .map(([key, config]) => `${key}=${config.value}`)
            .join('\n');

        fs.writeFileSync('.env', envContent);
        console.log('🔧 Created .env file for local development');
        
        // Add .env to .gitignore if not already there
        this.addToGitignore('.env');
    }

    addToGitignore(file) {
        const gitignorePath = '.gitignore';
        let gitignoreContent = '';
        
        if (fs.existsSync(gitignorePath)) {
            gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        }
        
        if (!gitignoreContent.includes(file)) {
            gitignoreContent += `\n# Environment variables\n${file}\n`;
            fs.writeFileSync(gitignorePath, gitignoreContent);
            console.log(`📝 Added ${file} to .gitignore`);
        }
    }

    async displayInstructions() {
        console.log('\n🎉 Setup Complete!\n');
        
        if (this.isReplit) {
            console.log('📋 Next Steps for Replit:');
            console.log('1. Check the REPLIT_SECRETS.md file for secret configuration');
            console.log('2. Add all secrets in Replit\'s Secrets tab (🔒)');
            console.log('3. Click the "Run" button to start your application');
            console.log('4. Your app will be available at: https://your-repl.repl.co');
        } else {
            console.log('📋 Next Steps for Local Development:');
            console.log('1. Review the generated .env file');
            console.log('2. Update any placeholder values with your actual credentials');
            console.log('3. Run: npm run dev');
            console.log('4. Your app will be available at: http://localhost:3333');
        }
        
        console.log('\n🔧 Files Created:');
        console.log('- .env.template (template for environment variables)');
        console.log('- replit-secrets-guide.json (JSON format secrets)');
        console.log('- REPLIT_SECRETS.md (readable secrets guide)');
        if (!this.isReplit) {
            console.log('- .env (local environment file)');
        }
        
        console.log('\n⚠️  Security Reminder:');
        console.log('- Never commit .env files to Git');
        console.log('- Keep your API keys secure');
        console.log('- Use different keys for development and production');
    }

    question(prompt) {
        return new Promise(resolve => {
            this.rl.question(prompt, resolve);
        });
    }
}

// Run the setup if this file is executed directly
if (require.main === module) {
    const setup = new ReplitEnvSetup();
    setup.setupEnvironment().catch(console.error);
}

module.exports = ReplitEnvSetup;