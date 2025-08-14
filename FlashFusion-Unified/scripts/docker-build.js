#!/usr/bin/env node

/**
 * Docker Build Script for FlashFusion Unified
 * Handles building, tagging, and pushing Docker images
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const DOCKER_REGISTRY = 'flashfusion';
const IMAGE_NAME = 'unified';
const VERSION = process.env.VERSION || getVersionFromPackage();

// Build configurations
const BUILD_CONFIGS = {
    development: {
        target: 'runner',
        tags: [`${DOCKER_REGISTRY}/${IMAGE_NAME}:dev`, `${DOCKER_REGISTRY}/${IMAGE_NAME}:dev-${VERSION}`],
        args: ['NODE_ENV=development']
    },
    production: {
        target: 'runner',
        tags: [`${DOCKER_REGISTRY}/${IMAGE_NAME}:latest`, `${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}`],
        args: ['NODE_ENV=production']
    },
    test: {
        target: 'runner',
        tags: [`${DOCKER_REGISTRY}/${IMAGE_NAME}:test`],
        args: ['NODE_ENV=test']
    }
};

function getVersionFromPackage() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        return packageJson.version;
    } catch (error) {
        return 'latest';
    }
}

function execCommand(command, description) {
    console.log(`\n🔄 ${description}...`);
    console.log(`   Command: ${command}`);
    
    try {
        const output = execSync(command, { 
            stdio: 'pipe',
            encoding: 'utf8',
            cwd: process.cwd()
        });
        console.log('✅ Success');
        return output;
    } catch (error) {
        console.error('❌ Failed:', error.message);
        if (error.stdout) console.log('STDOUT:', error.stdout);
        if (error.stderr) console.log('STDERR:', error.stderr);
        throw error;
    }
}

function buildImage(environment = 'production') {
    const config = BUILD_CONFIGS[environment];
    if (!config) {
        throw new Error(`Unknown environment: ${environment}`);
    }

    console.log(`🚀 Building FlashFusion Unified Docker Image`);
    console.log(`   Environment: ${environment}`);
    console.log(`   Version: ${VERSION}`);
    console.log(`   Tags: ${config.tags.join(', ')}`);

    // Build the image
    const tagArgs = config.tags.map(tag => `-t ${tag}`).join(' ');
    const buildArgs = config.args.map(arg => `--build-arg ${arg}`).join(' ');
    
    const buildCommand = `docker build ${tagArgs} ${buildArgs} --target ${config.target} .`;
    execCommand(buildCommand, 'Building Docker image');

    return config.tags;
}

function pushImages(tags) {
    console.log('\n📤 Pushing images to registry...');
    
    for (const tag of tags) {
        execCommand(`docker push ${tag}`, `Pushing ${tag}`);
    }
}

function testImage(tag) {
    console.log('\n🧪 Testing built image...');
    
    // Run container with health check
    const containerId = execCommand(
        `docker run -d --name ff-test-${Date.now()} -p 3334:3333 ${tag}`,
        'Starting test container'
    ).trim();

    try {
        // Wait for health check
        console.log('⏳ Waiting for health check...');
        execCommand(
            `docker exec ${containerId} node scripts/docker-health-check.js`,
            'Running health check'
        );

        console.log('✅ Image test passed');
    } finally {
        // Cleanup
        execCommand(`docker stop ${containerId}`, 'Stopping test container');
        execCommand(`docker rm ${containerId}`, 'Removing test container');
    }
}

function showImageInfo(tags) {
    console.log('\n📊 Image Information:');
    
    for (const tag of tags) {
        try {
            const info = execCommand(`docker inspect ${tag} --format='{{.Size}}'`, `Getting size for ${tag}`);
            const sizeInMB = Math.round(parseInt(info.trim()) / 1024 / 1024);
            console.log(`   ${tag}: ${sizeInMB} MB`);
        } catch (error) {
            console.log(`   ${tag}: Unable to get size`);
        }
    }
}

function cleanup() {
    console.log('\n🧹 Cleaning up build artifacts...');
    
    try {
        execCommand('docker system prune -f', 'Pruning Docker system');
        execCommand('docker builder prune -f', 'Pruning build cache');
    } catch (error) {
        console.warn('⚠️  Cleanup had some issues, but continuing...');
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const environment = args[0] || 'production';
    const shouldPush = args.includes('--push');
    const shouldTest = args.includes('--test');
    const shouldCleanup = args.includes('--cleanup');

    try {
        console.log('🐳 FlashFusion Unified Docker Build Script');
        console.log('==========================================');

        // Build image
        const tags = buildImage(environment);

        // Test image if requested
        if (shouldTest) {
            testImage(tags[0]);
        }

        // Push images if requested
        if (shouldPush) {
            pushImages(tags);
        }

        // Show image info
        showImageInfo(tags);

        // Cleanup if requested
        if (shouldCleanup) {
            cleanup();
        }

        console.log('\n🎉 Build completed successfully!');
        console.log('\n🔧 Quick commands:');
        console.log(`   Run locally: docker run -p 3333:3333 ${tags[0]}`);
        console.log(`   Run with env: docker run -p 3333:3333 --env-file .env ${tags[0]}`);
        console.log(`   Shell access: docker run -it --entrypoint sh ${tags[0]}`);

    } catch (error) {
        console.error('\n💥 Build failed:', error.message);
        process.exit(1);
    }
}

// Handle CLI usage
if (require.main === module) {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`
FlashFusion Unified Docker Build Script

Usage: node scripts/docker-build.js [environment] [options]

Environments:
  development  Build development image
  production   Build production image (default)
  test         Build test image

Options:
  --push       Push images to registry after building
  --test       Run health check test on built image
  --cleanup    Clean up Docker build artifacts
  --help, -h   Show this help message

Examples:
  node scripts/docker-build.js production --push
  node scripts/docker-build.js development --test
  node scripts/docker-build.js production --push --test --cleanup
        `);
        process.exit(0);
    }

    main();
}

module.exports = { buildImage, pushImages, testImage };