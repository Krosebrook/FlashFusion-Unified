#!/usr/bin/env node

/**
 * Key Rotation Tool for FlashFusion
 * Helps manage API key rotation and validation
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { promisify } = require('util');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = promisify(rl.question).bind(rl);

class KeyRotationManager {
    constructor() {
        this.envPath = path.join(__dirname, '..', '.env');
        this.envExamplePath = path.join(__dirname, '..', '.env.example');
        this.keyRotationLogPath = path.join(__dirname, '..', '.key-rotation-log.json');
        this.services = {
            OPENAI_API_KEY: {
                name: 'OpenAI',
                validator: (key) => key.startsWith('sk-'),
                url: 'https://platform.openai.com/api-keys',
                testEndpoint: 'https://api.openai.com/v1/models',
                headers: (key) => ({ 'Authorization': `Bearer ${key}` })
            },
            ANTHROPIC_API_KEY: {
                name: 'Anthropic',
                validator: (key) => key.startsWith('sk-ant-'),
                url: 'https://console.anthropic.com/settings/keys',
                testEndpoint: null // No public test endpoint
            },
            SUPABASE_URL: {
                name: 'Supabase URL',
                validator: (url) => url.includes('supabase.co'),
                url: 'https://supabase.com/dashboard/project/_/settings/api',
                skipTest: true
            },
            SUPABASE_ANON_KEY: {
                name: 'Supabase Anon Key',
                validator: (key) => key.startsWith('eyJ'),
                url: 'https://supabase.com/dashboard/project/_/settings/api'
            },
            GITHUB_TOKEN: {
                name: 'GitHub',
                validator: (key) => key.startsWith('ghp_') || key.startsWith('github_pat_'),
                url: 'https://github.com/settings/tokens',
                testEndpoint: 'https://api.github.com/user',
                headers: (key) => ({ 'Authorization': `token ${key}` })
            },
            VERCEL_TOKEN: {
                name: 'Vercel',
                validator: (key) => key.length > 20,
                url: 'https://vercel.com/account/tokens'
            }
        };
    }

    async init() {
        console.log('🔐 FlashFusion Key Rotation Tool\n');
        
        const action = await this.selectAction();
        
        switch (action) {
            case '1':
                await this.rotateAllKeys();
                break;
            case '2':
                await this.rotateSpecificKey();
                break;
            case '3':
                await this.validateKeys();
                break;
            case '4':
                await this.checkRotationHistory();
                break;
            case '5':
                await this.generateSecureKeys();
                break;
            default:
                console.log('Invalid option');
        }
        
        rl.close();
    }

    async selectAction() {
        console.log('What would you like to do?');
        console.log('1. Rotate all keys');
        console.log('2. Rotate specific key');
        console.log('3. Validate current keys');
        console.log('4. Check rotation history');
        console.log('5. Generate secure keys');
        
        return await question('\nSelect option (1-5): ');
    }

    async rotateAllKeys() {
        console.log('\n🔄 Starting full key rotation...\n');
        
        const currentEnv = await this.loadEnv();
        const newEnv = { ...currentEnv };
        const rotatedKeys = [];

        for (const [key, config] of Object.entries(this.services)) {
            console.log(`\n📍 ${config.name} (${key})`);
            console.log(`   Current value: ${this.maskKey(currentEnv[key])}`);
            console.log(`   Get new key at: ${config.url}`);
            
            const rotate = await question('   Rotate this key? (y/n): ');
            
            if (rotate.toLowerCase() === 'y') {
                const newValue = await question(`   Enter new ${key}: `);
                
                if (newValue && config.validator && !config.validator(newValue)) {
                    console.log('   ❌ Invalid key format!');
                    continue;
                }
                
                if (newValue) {
                    newEnv[key] = newValue;
                    rotatedKeys.push(key);
                    console.log('   ✅ Key updated');
                }
            }
        }

        if (rotatedKeys.length > 0) {
            await this.saveEnv(newEnv);
            await this.logRotation(rotatedKeys);
            console.log(`\n✅ Rotated ${rotatedKeys.length} keys successfully!`);
            console.log('\n⚠️  Remember to update these keys in:');
            console.log('   - Vercel dashboard environment variables');
            console.log('   - Any other deployment platforms');
        }
    }

    async rotateSpecificKey() {
        console.log('\n🔄 Select key to rotate:\n');
        
        const keys = Object.keys(this.services);
        keys.forEach((key, index) => {
            console.log(`${index + 1}. ${this.services[key].name} (${key})`);
        });
        
        const selection = await question('\nSelect key number: ');
        const selectedKey = keys[parseInt(selection) - 1];
        
        if (!selectedKey) {
            console.log('Invalid selection');
            return;
        }

        const config = this.services[selectedKey];
        const currentEnv = await this.loadEnv();
        
        console.log(`\n📍 Rotating ${config.name}`);
        console.log(`   Current: ${this.maskKey(currentEnv[selectedKey])}`);
        console.log(`   Get new key at: ${config.url}`);
        
        const newValue = await question('   Enter new value: ');
        
        if (newValue) {
            if (config.validator && !config.validator(newValue)) {
                console.log('❌ Invalid key format!');
                return;
            }
            
            currentEnv[selectedKey] = newValue;
            await this.saveEnv(currentEnv);
            await this.logRotation([selectedKey]);
            console.log('✅ Key rotated successfully!');
        }
    }

    async validateKeys() {
        console.log('\n🔍 Validating current keys...\n');
        
        const env = await this.loadEnv();
        let valid = 0;
        let invalid = 0;

        for (const [key, config] of Object.entries(this.services)) {
            const value = env[key];
            
            if (!value || value.includes('your_')) {
                console.log(`❌ ${config.name}: Missing or placeholder`);
                invalid++;
            } else if (config.validator && !config.validator(value)) {
                console.log(`❌ ${config.name}: Invalid format`);
                invalid++;
            } else {
                console.log(`✅ ${config.name}: Valid format`);
                valid++;
            }
        }

        console.log(`\n📊 Summary: ${valid} valid, ${invalid} invalid`);
        
        if (invalid > 0) {
            console.log('\n⚠️  Fix invalid keys before deployment!');
        }
    }

    async checkRotationHistory() {
        try {
            const log = await this.loadRotationLog();
            
            console.log('\n📅 Key Rotation History:\n');
            
            if (log.rotations.length === 0) {
                console.log('No rotation history found.');
                return;
            }

            log.rotations.slice(-10).forEach(entry => {
                console.log(`${new Date(entry.timestamp).toLocaleString()}`);
                console.log(`  Keys: ${entry.keys.join(', ')}`);
                console.log('');
            });

            // Check last rotation date
            const lastRotation = new Date(log.rotations[log.rotations.length - 1].timestamp);
            const daysSinceRotation = Math.floor((Date.now() - lastRotation) / (1000 * 60 * 60 * 24));
            
            if (daysSinceRotation > 30) {
                console.log(`⚠️  Last rotation was ${daysSinceRotation} days ago!`);
                console.log('   Consider rotating keys monthly for security.');
            }

        } catch (error) {
            console.log('No rotation history found.');
        }
    }

    async generateSecureKeys() {
        console.log('\n🔑 Generating secure keys...\n');
        
        console.log('JWT_SECRET:', this.generateSecureToken(64));
        console.log('ENCRYPTION_KEY:', this.generateSecureToken(32));
        console.log('SESSION_SECRET:', this.generateSecureToken(48));
        console.log('\n✅ Copy these secure keys to your .env file');
    }

    generateSecureToken(length) {
        return crypto.randomBytes(length).toString('base64').replace(/[+/=]/g, '');
    }

    maskKey(key) {
        if (!key) return 'Not set';
        if (key.length <= 8) return '***';
        return key.substring(0, 4) + '...' + key.substring(key.length - 4);
    }

    async loadEnv() {
        try {
            const content = await fs.readFile(this.envPath, 'utf-8');
            const env = {};
            
            content.split('\n').forEach(line => {
                if (line && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    if (key && valueParts.length > 0) {
                        env[key.trim()] = valueParts.join('=').trim();
                    }
                }
            });
            
            return env;
        } catch (error) {
            console.error('Error loading .env file:', error.message);
            return {};
        }
    }

    async saveEnv(env) {
        const envLines = [];
        
        // Read existing file to preserve comments and order
        try {
            const content = await fs.readFile(this.envPath, 'utf-8');
            const lines = content.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('#') || line.trim() === '') {
                    envLines.push(line);
                } else {
                    const [key] = line.split('=');
                    if (key && env[key.trim()] !== undefined) {
                        envLines.push(`${key.trim()}=${env[key.trim()]}`);
                        delete env[key.trim()];
                    } else {
                        envLines.push(line);
                    }
                }
            }
            
            // Add any new keys
            for (const [key, value] of Object.entries(env)) {
                envLines.push(`${key}=${value}`);
            }
            
        } catch (error) {
            // If file doesn't exist, create from scratch
            for (const [key, value] of Object.entries(env)) {
                envLines.push(`${key}=${value}`);
            }
        }
        
        await fs.writeFile(this.envPath, envLines.join('\n'));
    }

    async loadRotationLog() {
        try {
            const content = await fs.readFile(this.keyRotationLogPath, 'utf-8');
            return JSON.parse(content);
        } catch {
            return { rotations: [] };
        }
    }

    async logRotation(keys) {
        const log = await this.loadRotationLog();
        
        log.rotations.push({
            timestamp: new Date().toISOString(),
            keys: keys
        });
        
        // Keep only last 100 entries
        if (log.rotations.length > 100) {
            log.rotations = log.rotations.slice(-100);
        }
        
        await fs.writeFile(this.keyRotationLogPath, JSON.stringify(log, null, 2));
    }
}

// Run the tool
const manager = new KeyRotationManager();
manager.init().catch(console.error);