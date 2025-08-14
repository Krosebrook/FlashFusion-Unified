#!/usr/bin/env node

/**
 * Permanent Database Connection Setup Script
 * Configures persistent database connections for FlashFusion Unified
 */

const path = require('path');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupPermanentConnection() {
    console.log('🔧 FlashFusion Unified - Permanent Connection Setup');
    console.log('================================================\n');

    const envPath = path.join(__dirname, '../.env');
    const envExamplePath = path.join(__dirname, '../.env.example');

    // Check if .env exists
    if (!fs.existsSync(envPath)) {
        console.log('📝 Creating .env file from template...');
        if (fs.existsSync(envExamplePath)) {
            fs.copyFileSync(envExamplePath, envPath);
            console.log('✅ .env file created\n');
        } else {
            console.log('❌ .env.example not found. Creating basic .env file...');
            fs.writeFileSync(envPath, '# FlashFusion Unified Environment Configuration\n');
        }
    }

    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');

    console.log('Choose your database option:\n');
    console.log('1. Use existing Supabase (recommended for quick start)');
    console.log('2. Set up PostgreSQL connection');
    console.log('3. Configure both (automatic fallback)');

    const choice = await question('\nEnter your choice (1-3): ');

    switch (choice) {
        case '1':
            await setupSupabase(envContent, envPath);
            break;
        case '2':
            await setupPostgreSQL(envContent, envPath);
            break;
        case '3':
            await setupBoth(envContent, envPath);
            break;
        default:
            console.log('❌ Invalid choice');
            rl.close();
            return;
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Review your .env file configuration');
    console.log('2. Test connection: npm run test-postgresql');
    console.log('3. Start development: npm run dev');
    
    rl.close();
}

async function setupSupabase(envContent, envPath) {
    console.log('\n🔄 Configuring Supabase connection...');
    
    if (envContent.includes('SUPABASE_URL=') && !envContent.includes('SUPABASE_URL=your_supabase')) {
        console.log('✅ Supabase already configured in .env file');
        return;
    }

    const url = await question('Enter your Supabase URL: ');
    const anonKey = await question('Enter your Supabase Anon Key: ');
    const serviceKey = await question('Enter your Supabase Service Key (optional): ');

    envContent = updateEnvVar(envContent, 'SUPABASE_URL', url);
    envContent = updateEnvVar(envContent, 'SUPABASE_ANON_KEY', anonKey);
    if (serviceKey) {
        envContent = updateEnvVar(envContent, 'SUPABASE_SERVICE_KEY', serviceKey);
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Supabase configuration saved');
}

async function setupPostgreSQL(envContent, envPath) {
    console.log('\n🔄 Configuring PostgreSQL connection...');
    
    const useConnectionString = await question('Use connection string? (y/n): ');
    
    if (useConnectionString.toLowerCase() === 'y') {
        const connectionString = await question('Enter PostgreSQL connection string: ');
        envContent = updateEnvVar(envContent, 'POSTGRES_URL', connectionString);
    } else {
        const host = await question('PostgreSQL host (default: localhost): ') || 'localhost';
        const port = await question('PostgreSQL port (default: 5432): ') || '5432';
        const database = await question('Database name: ');
        const username = await question('Username: ');
        const password = await question('Password: ');

        envContent = updateEnvVar(envContent, 'POSTGRES_HOST', host);
        envContent = updateEnvVar(envContent, 'POSTGRES_PORT', port);
        envContent = updateEnvVar(envContent, 'POSTGRES_DB', database);
        envContent = updateEnvVar(envContent, 'POSTGRES_USER', username);
        envContent = updateEnvVar(envContent, 'POSTGRES_PASSWORD', password);

        const connectionString = `postgresql://${username}:${password}@${host}:${port}/${database}`;
        envContent = updateEnvVar(envContent, 'POSTGRES_URL', connectionString);
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ PostgreSQL configuration saved');
}

async function setupBoth(envContent, envPath) {
    await setupSupabase(envContent, envPath);
    envContent = fs.readFileSync(envPath, 'utf8'); // Re-read updated content
    await setupPostgreSQL(envContent, envPath);
}

function updateEnvVar(content, key, value) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;
    
    if (regex.test(content)) {
        return content.replace(regex, newLine);
    } else {
        return content + `\n${newLine}`;
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Setup cancelled');
    rl.close();
    process.exit(0);
});

if (require.main === module) {
    setupPermanentConnection().catch(error => {
        console.error('❌ Setup failed:', error.message);
        rl.close();
        process.exit(1);
    });
}

module.exports = { setupPermanentConnection };