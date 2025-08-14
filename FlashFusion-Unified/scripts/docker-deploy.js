#!/usr/bin/env node

/**
 * Docker Deployment Script for FlashFusion Unified
 * Handles authentication, building, and deploying Docker images
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

// Configuration
const DOCKER_REGISTRY = 'flashfusion';
const IMAGE_NAME = 'unified';
const VERSION = getVersionFromPackage();

function getVersionFromPackage() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        return packageJson.version;
    } catch (error) {
        return 'latest';
    }
}

function execCommand(command, description, options = {}) {
    console.log(`\n🔄 ${description}...`);
    
    try {
        const result = execSync(command, { 
            stdio: options.silent ? 'pipe' : 'inherit',
            encoding: 'utf8',
            cwd: process.cwd(),
            ...options
        });
        console.log('✅ Success');
        return result;
    } catch (error) {
        console.error('❌ Failed:', error.message);
        throw error;
    }
}

function authenticateDocker(token) {
    console.log('🔐 Authenticating with Docker Hub...');
    
    try {
        // Use access token to login
        execCommand(
            `echo "${token}" | docker login -u flashfusion --password-stdin`,
            'Docker Hub authentication',
            { silent: true }
        );
        
        console.log('✅ Docker authentication successful');
        return true;
    } catch (error) {
        console.error('❌ Docker authentication failed');
        return false;
    }
}

function buildAndPushImages() {
    const tags = [
        `${DOCKER_REGISTRY}/${IMAGE_NAME}:latest`,
        `${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}`,
        `${DOCKER_REGISTRY}/${IMAGE_NAME}:$(date +%Y%m%d)`
    ];

    console.log('\n🚀 Building FlashFusion Unified Docker Image');
    console.log(`   Version: ${VERSION}`);
    console.log(`   Tags: ${tags.join(', ')}`);

    // Build the image
    const tagArgs = tags.slice(0, 2).map(tag => `-t ${tag}`).join(' ');
    execCommand(
        `docker build ${tagArgs} --target runner .`,
        'Building Docker image'
    );

    // Tag with date
    execCommand(
        `docker tag ${tags[0]} ${DOCKER_REGISTRY}/${IMAGE_NAME}:$(date +%Y%m%d)`,
        'Adding date tag'
    );

    // Push all tags
    console.log('\n📤 Pushing images to Docker Hub...');
    for (const tag of tags.slice(0, 2)) {
        execCommand(`docker push ${tag}`, `Pushing ${tag}`);
    }

    // Push date tag
    execCommand(
        `docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:$(date +%Y%m%d)`,
        'Pushing date-tagged image'
    );

    return tags;
}

function testDeployment() {
    console.log('\n🧪 Testing deployment...');
    
    const testTag = `${DOCKER_REGISTRY}/${IMAGE_NAME}:latest`;
    
    // Run a quick test container
    const containerId = execCommand(
        `docker run -d --name ff-deploy-test-${Date.now()} -p 3335:3333 ${testTag}`,
        'Starting test deployment'
    ).trim();

    try {
        // Wait a moment for startup
        console.log('⏳ Waiting for container startup...');
        execCommand('sleep 10', 'Waiting for startup');

        // Run health check
        execCommand(
            `docker exec ${containerId} node scripts/docker-health-check.js`,
            'Running deployment health check'
        );

        console.log('✅ Deployment test passed');
    } finally {
        // Cleanup
        execCommand(`docker stop ${containerId}`, 'Stopping test container');
        execCommand(`docker rm ${containerId}`, 'Removing test container');
    }
}

function showDeploymentInfo(tags) {
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Deployment Information:');
    console.log(`   Registry: ${DOCKER_REGISTRY}`);
    console.log(`   Image: ${IMAGE_NAME}`);
    console.log(`   Version: ${VERSION}`);
    console.log(`   Tags deployed: ${tags.join(', ')}`);
    
    console.log('\n🚀 Usage Commands:');
    console.log(`   Pull latest: docker pull ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest`);
    console.log(`   Run container: docker run -d -p 3333:3333 --name flashfusion ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest`);
    console.log(`   Run with env: docker run -d -p 3333:3333 --env-file .env --name flashfusion ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest`);
    console.log(`   View logs: docker logs flashfusion`);
    console.log(`   Stop container: docker stop flashfusion`);
    
    console.log('\n🔗 Docker Hub Links:');
    console.log(`   Repository: https://hub.docker.com/r/${DOCKER_REGISTRY}/${IMAGE_NAME}`);
    console.log(`   Latest image: https://hub.docker.com/r/${DOCKER_REGISTRY}/${IMAGE_NAME}/tags`);
}

async function promptForToken() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('🔑 Enter your Docker Hub access token: ', (token) => {
            rl.close();
            resolve(token.trim());
        });
    });
}

async function main() {
    console.log('🐳 FlashFusion Unified Docker Deployment');
    console.log('=========================================');

    try {
        // Get access token
        let token = process.env.DOCKER_TOKEN || process.argv[2];
        
        if (!token) {
            token = await promptForToken();
        }

        if (!token) {
            console.error('❌ No access token provided');
            process.exit(1);
        }

        // Authenticate with Docker Hub
        const authenticated = authenticateDocker(token);
        if (!authenticated) {
            console.error('❌ Authentication failed');
            process.exit(1);
        }

        // Build and push images
        const tags = buildAndPushImages();

        // Test deployment
        const shouldTest = process.argv.includes('--test');
        if (shouldTest) {
            testDeployment();
        }

        // Show deployment info
        showDeploymentInfo(tags);

        console.log('\n🎯 Next steps:');
        console.log('   1. Verify images on Docker Hub');
        console.log('   2. Deploy to your production environment');
        console.log('   3. Set up monitoring and logging');

    } catch (error) {
        console.error('\n💥 Deployment failed:', error.message);
        process.exit(1);
    }
}

// Handle CLI usage
if (require.main === module) {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`
FlashFusion Unified Docker Deployment Script

Usage: node scripts/docker-deploy.js [token] [options]

Arguments:
  token        Docker Hub access token (optional, will prompt if not provided)

Environment Variables:
  DOCKER_TOKEN Docker Hub access token

Options:
  --test       Run deployment test after push
  --help, -h   Show this help message

Examples:
  node scripts/docker-deploy.js
  node scripts/docker-deploy.js your_token_here --test
  DOCKER_TOKEN=your_token npm run docker:deploy
        `);
        process.exit(0);
    }

    main();
}

module.exports = { authenticateDocker, buildAndPushImages, testDeployment };