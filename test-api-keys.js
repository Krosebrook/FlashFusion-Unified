#!/usr/bin/env node
/**
 * API Key Testing Script
 * Tests all your API keys to make sure they work before deployment
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const chalk = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    bold: (text) => `\x1b[1m${text}\x1b[0m`
};

console.log(chalk.bold('\n🧪 FlashFusion API Key Testing Suite\n'));

let passedTests = 0;
let totalTests = 0;

async function testAnthropicAPI() {
    totalTests++;
    console.log(chalk.blue('🤖 Testing Anthropic API...'));
    
    if (!process.env.ANTHROPIC_API_KEY) {
        console.log(chalk.red('❌ ANTHROPIC_API_KEY not found'));
        return false;
    }

    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }]
        }, {
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            timeout: 10000
        });

        if (response.status === 200) {
            console.log(chalk.green('✅ Anthropic API: Working'));
            passedTests++;
            return true;
        }
    } catch (error) {
        if (error.response?.status === 401) {
            console.log(chalk.red('❌ Anthropic API: Invalid key'));
        } else if (error.response?.status === 429) {
            console.log(chalk.yellow('⚠️  Anthropic API: Rate limited (but key is valid)'));
            passedTests++;
            return true;
        } else {
            console.log(chalk.red(`❌ Anthropic API: ${error.message}`));
        }
    }
    return false;
}

async function testOpenAIAPI() {
    totalTests++;
    console.log(chalk.blue('🤖 Testing OpenAI API...'));
    
    if (!process.env.OPENAI_API_KEY) {
        console.log(chalk.red('❌ OPENAI_API_KEY not found'));
        return false;
    }

    try {
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.status === 200) {
            console.log(chalk.green('✅ OpenAI API: Working'));
            passedTests++;
            return true;
        }
    } catch (error) {
        if (error.response?.status === 401) {
            console.log(chalk.red('❌ OpenAI API: Invalid key'));
        } else if (error.response?.status === 429) {
            console.log(chalk.yellow('⚠️  OpenAI API: Rate limited (but key is valid)'));
            passedTests++;
            return true;
        } else {
            console.log(chalk.red(`❌ OpenAI API: ${error.message}`));
        }
    }
    return false;
}

async function testSupabaseAPI() {
    totalTests++;
    console.log(chalk.blue('🗄️ Testing Supabase connection...'));
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.log(chalk.red('❌ Supabase credentials not found'));
        return false;
    }

    try {
        const response = await axios.get(`${process.env.SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': process.env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
            },
            timeout: 10000
        });

        if (response.status === 200) {
            console.log(chalk.green('✅ Supabase: Connected'));
            passedTests++;
            return true;
        }
    } catch (error) {
        if (error.response?.status === 401) {
            console.log(chalk.red('❌ Supabase: Invalid credentials'));
        } else {
            console.log(chalk.red(`❌ Supabase: ${error.message}`));
        }
    }
    return false;
}

async function testGoogleAI() {
    totalTests++;
    console.log(chalk.blue('🤖 Testing Google AI API...'));
    
    if (!process.env.GOOGLE_AI_API_KEY) {
        console.log(chalk.red('❌ GOOGLE_AI_API_KEY not found'));
        return false;
    }

    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GOOGLE_AI_API_KEY}`, {
            timeout: 10000
        });

        if (response.status === 200) {
            console.log(chalk.green('✅ Google AI API: Working'));
            passedTests++;
            return true;
        }
    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log(chalk.red('❌ Google AI API: Invalid key'));
        } else {
            console.log(chalk.red(`❌ Google AI API: ${error.message}`));
        }
    }
    return false;
}

async function runAllTests() {
    console.log(chalk.bold('Starting API tests...\n'));

    await testAnthropicAPI();
    await testOpenAIAPI();
    await testSupabaseAPI();
    await testGoogleAI();

    console.log('\n' + chalk.bold('📊 Test Results:'));
    console.log(`${chalk.green(`✅ Passed: ${passedTests}`)} / ${chalk.blue(`Total: ${totalTests}`)}`);
    
    if (passedTests === totalTests) {
        console.log(chalk.green('\n🎉 All API keys are working! Ready for deployment.'));
        process.exit(0);
    } else {
        console.log(chalk.yellow('\n⚠️  Some API keys need attention. Fix them before deployment.'));
        process.exit(1);
    }
}

// Run tests
runAllTests().catch(error => {
    console.error(chalk.red('Test runner failed:'), error.message);
    process.exit(1);
});