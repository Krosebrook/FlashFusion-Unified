const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Script to fix Supabase Edge Functions secrets
 * This script helps configure the required secrets for Edge Functions
 */

const REQUIRED_SECRETS = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'MONGODB_URI',
  'JWT_SECRET',
  'NOTION_API_KEY'
];

async function fixSupabaseSecrets() {
  console.log('🔧 FlashFusion Supabase Edge Functions Secret Repair');
  console.log('=' .repeat(60));

  try {
    // Check if Supabase CLI is installed
    try {
      execSync('supabase --version', { stdio: 'pipe' });
      console.log('✅ Supabase CLI is installed');
    } catch (error) {
      console.log('❌ Supabase CLI not found. Installing...');
      console.log('Run: npm install -g supabase');
      console.log('Or visit: https://supabase.com/docs/guides/cli');
      return;
    }

    // Check if logged in
    try {
      execSync('supabase projects list', { stdio: 'pipe' });
      console.log('✅ Logged into Supabase CLI');
    } catch (error) {
      console.log('❌ Not logged into Supabase CLI');
      console.log('Run: supabase login');
      return;
    }

    // Check current secrets
    console.log('\n📋 Checking current secrets...');
    try {
      const secretsList = execSync('supabase secrets list', { encoding: 'utf8' });
      console.log('Current secrets:', secretsList);
    } catch (error) {
      console.log('⚠️ Could not list secrets. Make sure you are linked to a project.');
      console.log('Run: supabase link --project-ref YOUR_PROJECT_REF');
    }

    // Load environment variables
    console.log('\n🔍 Loading environment variables...');
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found. Creating from .env.example...');
      const examplePath = path.join(process.cwd(), '.env.example');
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        console.log('✅ Created .env file from .env.example');
        console.log('⚠️ Please edit .env file with your actual values');
      } else {
        console.log('❌ .env.example file not found');
        return;
      }
    }

    // Generate the secrets configuration commands
    console.log('\n🔐 Generating secrets configuration...');
    const secretCommands = [];

    REQUIRED_SECRETS.forEach(secretName => {
      const value = process.env[secretName];
      if (value && value !== 'your_' + secretName.toLowerCase() && !value.includes('<') && !value.includes('your-')) {
        secretCommands.push(`supabase secrets set ${secretName}="${value}"`);
        console.log(`✅ ${secretName}: configured`);
      } else {
        console.log(`⚠️ ${secretName}: not configured or using placeholder value`);
        secretCommands.push(`# supabase secrets set ${secretName}="YOUR_ACTUAL_${secretName}"`);
      }
    });

    // Write commands to a script file
    const scriptContent = `#!/bin/bash
# FlashFusion Supabase Secrets Configuration Script
# Generated on ${new Date().toISOString()}

echo "🔐 Setting up Supabase Edge Function secrets..."

${secretCommands.join('\n')}

echo "✅ Secrets configuration complete!"
echo ""
echo "🚀 Deploy Edge Functions:"
echo "supabase functions deploy ai-orchestrator"
echo "supabase functions deploy generate-image"
echo ""
echo "📊 Check function logs:"
echo "supabase functions logs ai-orchestrator"
echo "supabase functions logs generate-image"
`;

    const scriptPath = path.join(process.cwd(), 'setup-supabase-secrets.sh');
    fs.writeFileSync(scriptPath, scriptContent);
    console.log(`\n📝 Created script: ${scriptPath}`);

    // Create Windows batch file version
    const batchContent = `@echo off
REM FlashFusion Supabase Secrets Configuration Script
REM Generated on ${new Date().toISOString()}

echo 🔐 Setting up Supabase Edge Function secrets...

${secretCommands.join('\n')}

echo ✅ Secrets configuration complete!
echo.
echo 🚀 Deploy Edge Functions:
echo supabase functions deploy ai-orchestrator
echo supabase functions deploy generate-image
echo.
echo 📊 Check function logs:
echo supabase functions logs ai-orchestrator
echo supabase functions logs generate-image

pause
`;

    const batchPath = path.join(process.cwd(), 'setup-supabase-secrets.bat');
    fs.writeFileSync(batchPath, batchContent);
    console.log(`📝 Created batch file: ${batchPath}`);

    // Create database schema for Edge Functions
    const schemaSql = `-- Edge Functions Database Schema
-- Run this in your Supabase SQL editor

-- AI Interactions table for logging AI requests
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    tokens_used INTEGER,
    context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Images table for image generation tracking
CREATE TABLE IF NOT EXISTS public.generated_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    model TEXT NOT NULL,
    size TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI interactions" ON public.ai_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI interactions" ON public.ai_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own generated images" ON public.generated_images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create generated images" ON public.generated_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON public.ai_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON public.generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON public.generated_images(created_at DESC);
`;

    const schemaPath = path.join(process.cwd(), 'database', 'edge-functions-schema.sql');
    fs.writeFileSync(schemaPath, schemaSql);
    console.log(`📝 Created database schema: ${schemaPath}`);

    // Instructions
    console.log('\n🚀 Next Steps:');
    console.log('1. Edit .env file with your actual API keys');
    console.log('2. Run the secrets script:');
    console.log('   - Linux/Mac: chmod +x setup-supabase-secrets.sh && ./setup-supabase-secrets.sh');
    console.log('   - Windows: setup-supabase-secrets.bat');
    console.log('3. Run the database schema in Supabase SQL editor:');
    console.log('   - Copy contents of database/edge-functions-schema.sql');
    console.log('4. Deploy Edge Functions:');
    console.log('   - supabase functions deploy ai-orchestrator');
    console.log('   - supabase functions deploy generate-image');
    console.log('5. Test the functions in your React app');

    console.log('\n✅ Supabase Edge Functions setup complete!');

  } catch (error) {
    console.error('❌ Error fixing Supabase secrets:', error.message);
    console.log('\n🔧 Manual steps to fix:');
    console.log('1. Install Supabase CLI: npm install -g supabase');
    console.log('2. Login: supabase login');
    console.log('3. Link to project: supabase link --project-ref YOUR_PROJECT_REF');
    console.log('4. Set secrets manually:');
    REQUIRED_SECRETS.forEach(secret => {
      console.log(`   supabase secrets set ${secret}="your_actual_${secret.toLowerCase()}"`);
    });
  }
}

// MongoDB connection helper
function generateMongoDBConnectionGuide() {
  console.log('\n🍃 MongoDB Atlas Setup Guide:');
  console.log('1. Go to https://cloud.mongodb.com/');
  console.log('2. Create a new cluster or use existing');
  console.log('3. Create a database user:');
  console.log('   - Go to Database Access');
  console.log('   - Add New Database User');
  console.log('   - Choose password authentication');
  console.log('   - Set username and password');
  console.log('4. Whitelist your IP:');
  console.log('   - Go to Network Access');
  console.log('   - Add IP Address');
  console.log('   - Add 0.0.0.0/0 for all IPs (development only)');
  console.log('5. Get connection string:');
  console.log('   - Go to Database > Connect');
  console.log('   - Choose "Connect your application"');
  console.log('   - Copy the connection string');
  console.log('   - Replace <password> with your actual password');
  console.log('6. Update .env file with MONGODB_URI');
}

if (require.main === module) {
  fixSupabaseSecrets();
  generateMongoDBConnectionGuide();
}

module.exports = { fixSupabaseSecrets };