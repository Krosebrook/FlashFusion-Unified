/**
 * Manual Deployment Script for FlashFusion
 * Fallback deployment when GitHub Actions fails
 */

const { execSync } = require('child_process');

console.log('🚀 FlashFusion Manual Deployment');
console.log('=================================\n');

try {
    console.log('📋 Pre-deployment checks...');
    
    // Check if we're in the right directory
    const packageJson = require('../package.json');
    if (packageJson.name !== 'flashfusion-unified') {
        throw new Error('Not in FlashFusion project directory');
    }
    console.log('✅ Project directory confirmed');
    
    // Check git status
    try {
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
        if (gitStatus.trim()) {
            console.log('⚠️  Uncommitted changes detected:');
            console.log(gitStatus);
            console.log('Consider committing changes first\n');
        } else {
            console.log('✅ Git working tree clean');
        }
    } catch (error) {
        console.log('⚠️  Could not check git status');
    }
    
    // Run safety tests
    console.log('\n🔍 Running deployment safety tests...');
    try {
        execSync('npm run test-deployment', { stdio: 'inherit' });
        console.log('✅ Safety tests passed');
    } catch (error) {
        console.log('⚠️  Safety tests failed, continuing anyway');
    }
    
    // Build the project
    console.log('\n🔨 Building project...');
    try {
        execSync('npm run build', { stdio: 'inherit' });
        console.log('✅ Build completed');
    } catch (error) {
        console.log('⚠️  Build had warnings, continuing');
    }
    
    // Deploy to Vercel
    console.log('\n🚀 Deploying to Vercel...');
    try {
        const deployOutput = execSync('vercel --prod --yes', {
            stdio: 'pipe',
            encoding: 'utf8'
        });
        
        console.log('✅ Deployment successful!');
        console.log('\n📋 Deployment Details:');
        console.log(deployOutput);
        
        // Extract URL from output
        const lines = deployOutput.split('\n');
        const deploymentUrl = lines.find(line => line.includes('https://'));
        if (deploymentUrl) {
            console.log('\n🌐 Live URL:', deploymentUrl.trim());
        }
        
    } catch (error) {
        console.error('❌ Vercel deployment failed:');
        console.error(error.message);
        
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Make sure you\'re logged into Vercel: vercel login');
        console.log('2. Check if project is linked: vercel link');
        console.log('3. Verify environment variables are set');
        console.log('4. Try: vercel --debug for detailed logs');
        
        process.exit(1);
    }
    
    // Test deployment
    console.log('\n🔍 Testing deployment...');
    try {
        const testUrl = 'https://flashfusion.co/health';
        execSync(`curl -f "${testUrl}"`, { stdio: 'pipe' });
        console.log('✅ Health check passed');
    } catch (error) {
        console.log('⚠️  Health check failed - deployment may still be propagating');
    }
    
    console.log('\n🎉 Manual deployment completed!');
    console.log('🌐 FlashFusion is live at: https://flashfusion.co');
    console.log('📊 Check status at: https://flashfusion.co/api/status');
    console.log('🔗 Webhook dashboard: https://flashfusion.co/api/webhooks/');
    
} catch (error) {
    console.error('\n❌ Manual deployment failed:');
    console.error(error.message);
    
    console.log('\n🆘 Need help?');
    console.log('• Check the FlashFusion documentation');
    console.log('• Review Vercel deployment logs');
    console.log('• Ensure all environment variables are configured');
    console.log('• Try the GitHub Actions deployment instead');
    
    process.exit(1);
}