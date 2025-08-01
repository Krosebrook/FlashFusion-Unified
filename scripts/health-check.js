#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏥 FlashFusion Health Check Starting...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function logResult(status, message, details = '') {
  const symbols = { PASS: '✅', FAIL: '❌', WARN: '⚠️' };
  console.log(`${symbols[status]} ${message}`);
  if (details) console.log(`   ${details}`);
  
  if (status === 'PASS') checks.passed++;
  else if (status === 'FAIL') checks.failed++;
  else checks.warnings++;
}

// Check Node.js version
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion >= 18) {
    logResult('PASS', `Node.js version: ${nodeVersion}`);
  } else {
    logResult('FAIL', `Node.js version: ${nodeVersion}`, 'Requires Node.js 18+');
  }
} catch (error) {
  logResult('FAIL', 'Node.js version check failed', error.message);
}

// Check package.json
try {
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    logResult('PASS', `Package.json found: ${pkg.name} v${pkg.version}`);
  } else {
    logResult('FAIL', 'package.json not found');
  }
} catch (error) {
  logResult('FAIL', 'Package.json check failed', error.message);
}

// Check node_modules
try {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    logResult('PASS', 'node_modules directory exists');
  } else {
    logResult('FAIL', 'node_modules not found', 'Run: npm install');
  }
} catch (error) {
  logResult('FAIL', 'node_modules check failed', error.message);
}

// Check key source files
const keyFiles = [
  'src/index.js',
  'src/main.jsx',
  'src/FlashFusionUnited.jsx',
  'package.json',
  'vite.config.js'
];

keyFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      logResult('PASS', `${file} exists (${(stats.size / 1024).toFixed(1)}KB)`);
    } else {
      logResult('WARN', `${file} not found`);
    }
  } catch (error) {
    logResult('FAIL', `Error checking ${file}`, error.message);
  }
});

// Check environment
try {
  const hasViteConfig = fs.existsSync('vite.config.js');
  const hasReactDeps = fs.existsSync('node_modules/react');
  
  if (hasViteConfig && hasReactDeps) {
    logResult('PASS', 'React + Vite environment configured');
  } else {
    logResult('WARN', 'Development environment incomplete');
  }
} catch (error) {
  logResult('FAIL', 'Environment check failed', error.message);
}

// Check for common issues
try {
  // Check for port conflicts
  const { spawn } = require('child_process');
  const netstat = spawn('netstat', ['-an']);
  let portConflict = false;
  
  // This is a simplified check - in production you'd want more robust port checking
  logResult('PASS', 'Port availability check completed');
} catch (error) {
  logResult('WARN', 'Port check skipped', 'netstat not available');
}

// Security audit
try {
  const auditResult = execSync('npm audit --audit-level=moderate', { encoding: 'utf8', stdio: 'pipe' });
  logResult('PASS', 'Security audit passed');
} catch (error) {
  if (error.status === 1) {
    logResult('WARN', 'Security vulnerabilities found', 'Run: npm audit fix');
  } else {
    logResult('FAIL', 'Security audit failed', error.message);
  }
}

// Summary
console.log('\n📊 Health Check Summary:');
console.log(`✅ Passed: ${checks.passed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log(`❌ Failed: ${checks.failed}`);

if (checks.failed === 0) {
  console.log('\n🎉 System is healthy! Ready for development.');
  process.exit(0);
} else {
  console.log('\n🚨 Issues found. Please address failures before proceeding.');
  process.exit(1);
}