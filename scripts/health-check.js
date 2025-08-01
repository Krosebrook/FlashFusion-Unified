#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Handle different chalk versions
const chalkRed = typeof chalk.red === 'function' ? chalk.red : (text) => `\x1b[31m${text}\x1b[0m`;
const chalkGreen = typeof chalk.green === 'function' ? chalk.green : (text) => `\x1b[32m${text}\x1b[0m`;
const chalkYellow = typeof chalk.yellow === 'function' ? chalk.yellow : (text) => `\x1b[33m${text}\x1b[0m`;
const chalkBlue = typeof chalk.blue === 'function' ? chalk.blue : (text) => `\x1b[34m${text}\x1b[0m`;
const chalkBold = typeof chalk.bold === 'function' ? chalk.bold : (text) => `\x1b[1m${text}\x1b[0m`;

class HealthChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    switch (type) {
      case 'success':
        console.log(chalkGreen(`✅ [${timestamp}] ${message}`));
        this.passed.push(message);
        break;
      case 'warning':
        console.log(chalkYellow(`⚠️  [${timestamp}] ${message}`));
        this.warnings.push(message);
        break;
      case 'error':
        console.log(chalkRed(`❌ [${timestamp}] ${message}`));
        this.issues.push(message);
        break;
      default:
        console.log(chalkBlue(`ℹ️  [${timestamp}] ${message}`));
    }
  }

  checkFileExists(filePath, description) {
    try {
      if (fs.existsSync(filePath)) {
        this.log(`${description} exists: ${filePath}`, 'success');
        return true;
      } else {
        this.log(`${description} missing: ${filePath}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Error checking ${description}: ${error.message}`, 'error');
      return false;
    }
  }

  checkNodeModules() {
    this.log('Checking Node.js dependencies...', 'info');
    
    if (!this.checkFileExists('node_modules', 'Node modules directory')) {
      this.log('Run "npm install" to install dependencies', 'warning');
      return false;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});
      
      this.log(`Found ${dependencies.length} dependencies and ${devDependencies.length} dev dependencies`, 'success');
      
      // Check critical dependencies
      const criticalDeps = ['express', 'dotenv', 'axios'];
      for (const dep of criticalDeps) {
        if (dependencies.includes(dep)) {
          this.log(`Critical dependency ${dep} is installed`, 'success');
        } else {
          this.log(`Critical dependency ${dep} is missing`, 'error');
        }
      }
      
      return true;
    } catch (error) {
      this.log(`Error checking dependencies: ${error.message}`, 'error');
      return false;
    }
  }

  checkEnvironment() {
    this.log('Checking environment configuration...', 'info');
    
    // Check for environment files
    const envFiles = ['.env', '.env.local', '.env.production'];
    let hasEnvFile = false;
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        this.log(`Environment file found: ${envFile}`, 'success');
        hasEnvFile = true;
      }
    }
    
    if (!hasEnvFile) {
      this.log('No environment files found - using system environment variables', 'warning');
    }

    // Check Node.js version
    try {
      const nodeVersion = process.version;
      this.log(`Node.js version: ${nodeVersion}`, 'success');
      
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion < 18) {
        this.log('Node.js version should be 18 or higher', 'warning');
      }
    } catch (error) {
      this.log(`Error checking Node.js version: ${error.message}`, 'error');
    }

    return true;
  }

  checkProjectStructure() {
    this.log('Checking project structure...', 'info');
    
    const requiredDirs = ['src', 'scripts', 'client'];
    const requiredFiles = ['package.json', 'README.md'];
    
    let structureValid = true;
    
    for (const dir of requiredDirs) {
      if (!this.checkFileExists(dir, `Directory ${dir}`)) {
        structureValid = false;
      }
    }
    
    for (const file of requiredFiles) {
      if (!this.checkFileExists(file, `File ${file}`)) {
        structureValid = false;
      }
    }
    
    return structureValid;
  }

  checkGitStatus() {
    this.log('Checking Git status...', 'info');
    
    try {
      if (!fs.existsSync('.git')) {
        this.log('Git repository not initialized', 'warning');
        return false;
      }
      
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim() === '') {
        this.log('Working tree is clean', 'success');
      } else {
        const changes = status.trim().split('\n').length;
        this.log(`${changes} uncommitted changes found`, 'warning');
      }
      
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      this.log(`Current branch: ${branch}`, 'success');
      
      return true;
    } catch (error) {
      this.log(`Error checking Git status: ${error.message}`, 'error');
      return false;
    }
  }

  checkServices() {
    this.log('Checking service configuration...', 'info');
    
    // Check if main entry points exist
    const entryPoints = [
      'src/index.js',
      'src/server/server.js',
      'src/main.jsx'
    ];
    
    let hasEntryPoint = false;
    for (const entry of entryPoints) {
      if (fs.existsSync(entry)) {
        this.log(`Entry point found: ${entry}`, 'success');
        hasEntryPoint = true;
      }
    }
    
    if (!hasEntryPoint) {
      this.log('No main entry points found', 'error');
    }
    
    return hasEntryPoint;
  }

  async runHealthCheck() {
    console.log(chalkBold(chalkBlue('\n🔍 FlashFusion Unified - Health Check\n')));
    
    const checks = [
      () => this.checkProjectStructure(),
      () => this.checkNodeModules(),
      () => this.checkEnvironment(),
      () => this.checkGitStatus(),
      () => this.checkServices()
    ];
    
    for (const check of checks) {
      try {
        await check();
      } catch (error) {
        this.log(`Health check failed: ${error.message}`, 'error');
      }
    }
    
    // Summary
    console.log(chalkBold('\n📊 Health Check Summary:'));
    console.log(chalkGreen(`✅ Passed: ${this.passed.length}`));
    console.log(chalkYellow(`⚠️  Warnings: ${this.warnings.length}`));
    console.log(chalkRed(`❌ Issues: ${this.issues.length}`));
    
    if (this.issues.length > 0) {
      console.log(chalkRed('\n🚨 Critical Issues Found:'));
      this.issues.forEach(issue => console.log(chalkRed(`  • ${issue}`)));
    }
    
    if (this.warnings.length > 0) {
      console.log(chalkYellow('\n⚠️  Warnings:'));
      this.warnings.forEach(warning => console.log(chalkYellow(`  • ${warning}`)));
    }
    
    if (this.issues.length === 0) {
      console.log(chalkGreen('\n🎉 System appears healthy!'));
      process.exit(0);
    } else {
      console.log(chalkRed('\n💥 Please address the issues above before proceeding.'));
      process.exit(1);
    }
  }
}

// Run health check if this script is executed directly
if (require.main === module) {
  const healthChecker = new HealthChecker();
  healthChecker.runHealthCheck().catch(error => {
    console.error(chalkRed(`Health check failed: ${error.message}`));
    process.exit(1);
  });
}

module.exports = HealthChecker;