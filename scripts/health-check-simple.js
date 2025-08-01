#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SimpleHealthChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const symbols = {
      success: '✅',
      warning: '⚠️ ',
      error: '❌',
      info: 'ℹ️ '
    };
    
    console.log(`${symbols[type] || symbols.info} [${timestamp}] ${message}`);
    
    switch (type) {
      case 'success':
        this.passed.push(message);
        break;
      case 'warning':
        this.warnings.push(message);
        break;
      case 'error':
        this.issues.push(message);
        break;
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

  async runHealthCheck() {
    console.log('\n🔍 FlashFusion Unified - Simple Health Check\n');
    
    const checks = [
      () => this.checkProjectStructure(),
      () => this.checkNodeModules(),
      () => this.checkEnvironment(),
      () => this.checkGitStatus()
    ];
    
    for (const check of checks) {
      try {
        await check();
      } catch (error) {
        this.log(`Health check failed: ${error.message}`, 'error');
      }
    }
    
    // Summary
    console.log('\n📊 Health Check Summary:');
    console.log(`✅ Passed: ${this.passed.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Issues: ${this.issues.length}`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 Critical Issues Found:');
      this.issues.forEach(issue => console.log(`  • ${issue}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.issues.length === 0) {
      console.log('\n🎉 System appears healthy!');
      process.exit(0);
    } else {
      console.log('\n💥 Please address the issues above before proceeding.');
      process.exit(1);
    }
  }
}

// Run health check if this script is executed directly
if (require.main === module) {
  const healthChecker = new SimpleHealthChecker();
  healthChecker.runHealthCheck().catch(error => {
    console.error(`Health check failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = SimpleHealthChecker;