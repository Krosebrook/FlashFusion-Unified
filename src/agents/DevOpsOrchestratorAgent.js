/**
 * DevOps Orchestrator Agent
 * Autonomous agent that manages the complete deployment pipeline:
 * Replit → GitHub → Vercel → GoDaddy → FlashFusion.co
 */

const { EventEmitter } = require('events');
const { exec } = require('child_process');
const fs = require('fs').promises;
const axios = require('axios');

class DevOpsOrchestratorAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      replitWebhookUrl: process.env.REPLIT_WEBHOOK_URL,
      githubToken: process.env.GITHUB_TOKEN,
      vercelToken: process.env.VERCEL_TOKEN,
      vercelOrgId: process.env.VERCEL_ORG_ID,
      vercelProjectId: process.env.VERCEL_PROJECT_ID,
      godaddyApiKey: process.env.GODADDY_API_KEY,
      godaddySecret: process.env.GODADDY_API_SECRET,
      domain: 'flashfusion.co',
      repository: 'Krosebrook/FlashFusion-Unified',
      ...config
    };
    
    this.isActive = false;
    this.deploymentQueue = [];
    this.lastDeployment = null;
    this.healthChecks = new Map();
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.on('codeChange', this.handleCodeChange.bind(this));
    this.on('deploymentComplete', this.handleDeploymentComplete.bind(this));
    this.on('deploymentFailed', this.handleDeploymentFailure.bind(this));
  }

  /**
   * Start the autonomous agent
   */
  async start() {
    console.log('🤖 Starting DevOps Orchestrator Agent...');
    
    try {
      await this.validateConfiguration();
      await this.setupReplitSync();
      await this.initializeHealthMonitoring();
      
      this.isActive = true;
      console.log('✅ DevOps Orchestrator Agent active');
      
      // Start monitoring loop
      this.startMonitoringLoop();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to start DevOps Agent:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate all required configuration
   */
  async validateConfiguration() {
    const required = ['githubToken', 'vercelToken', 'vercelOrgId', 'vercelProjectId'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required config: ${missing.join(', ')}`);
    }
    
    // Test GitHub API
    await this.testGitHubConnection();
    
    // Test Vercel API
    await this.testVercelConnection();
    
    console.log('✅ Configuration validated');
  }

  /**
   * Set up Replit synchronization
   */
  async setupReplitSync() {
    // Create .replit configuration
    const replitConfig = {
      language: "nodejs",
      run: "npm start",
      entrypoint: "src/index.js",
      hidden: [".config", "package-lock.json"],
      compile: "npm install",
      modules: ["nodejs-18"],
      onBoot: "npm install",
      channel: "stable",
      
      // GitHub integration
      gitHubImport: {
        requiredFiles: [".replit", "replit.nix", "package.json"]
      },
      
      // Auto-sync settings
      deployment: {
        run: "npm start",
        deploymentTarget: "gce",
        ignorePorts: false
      }
    };
    
    await fs.writeFile('.replit', JSON.stringify(replitConfig, null, 2));
    
    // Create replit.nix for package management
    const nixConfig = `{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
    pkgs.git
    pkgs.curl
  ];
}`;
    
    await fs.writeFile('replit.nix', nixConfig);
    
    console.log('✅ Replit sync configuration created');
  }

  /**
   * Initialize health monitoring
   */
  async initializeHealthMonitoring() {
    this.healthChecks.set('github', { status: 'pending', lastCheck: null });
    this.healthChecks.set('vercel', { status: 'pending', lastCheck: null });
    this.healthChecks.set('domain', { status: 'pending', lastCheck: null });
    this.healthChecks.set('ssl', { status: 'pending', lastCheck: null });
    
    console.log('✅ Health monitoring initialized');
  }

  /**
   * Start the main monitoring loop
   */
  startMonitoringLoop() {
    // Check for changes every 30 seconds
    setInterval(async () => {
      if (!this.isActive) return;
      
      try {
        await this.checkForChanges();
        await this.runHealthChecks();
        await this.processDeploymentQueue();
      } catch (error) {
        console.error('Monitor loop error:', error.message);
      }
    }, 30000);
    
    console.log('🔄 Monitoring loop started');
  }

  /**
   * Check for code changes that need deployment
   */
  async checkForChanges() {
    try {
      const { stdout } = await this.execAsync('git status --porcelain');
      
      if (stdout.trim()) {
        console.log('📝 Code changes detected');
        this.emit('codeChange', { changes: stdout.trim() });
      }
    } catch (error) {
      console.error('Error checking changes:', error.message);
    }
  }

  /**
   * Handle detected code changes
   */
  async handleCodeChange(data) {
    console.log('🔄 Processing code changes...');
    
    try {
      // Auto-commit changes
      const commitMessage = await this.generateCommitMessage(data.changes);
      await this.autoCommit(commitMessage);
      
      // Queue deployment
      this.queueDeployment({
        type: 'code_change',
        timestamp: new Date().toISOString(),
        changes: data.changes
      });
      
    } catch (error) {
      console.error('Error handling code change:', error.message);
    }
  }

  /**
   * Generate semantic commit message
   */
  async generateCommitMessage(changes) {
    const lines = changes.split('\\n');
    const modified = lines.filter(l => l.startsWith(' M')).length;
    const added = lines.filter(l => l.startsWith('??')).length;
    const deleted = lines.filter(l => l.startsWith(' D')).length;
    
    let type = 'chore';
    let description = 'update files';
    
    if (added > 0 && modified === 0) {
      type = 'feat';
      description = 'add new features';
    } else if (deleted > 0) {
      type = 'refactor';
      description = 'cleanup and optimize';
    } else if (modified > 0) {
      type = 'fix';
      description = 'improve functionality';
    }
    
    return `${type}: ${description}

🤖 Auto-deployment via DevOps Agent
- Modified: ${modified} files
- Added: ${added} files  
- Deleted: ${deleted} files

🚀 Deploying to FlashFusion.co`;
  }

  /**
   * Auto-commit changes to GitHub
   */
  async autoCommit(message) {
    try {
      await this.execAsync('git add .');
      await this.execAsync(`git commit -m "${message}"`);
      await this.execAsync('git push origin master');
      
      console.log('✅ Changes committed and pushed');
    } catch (error) {
      console.error('Error auto-committing:', error.message);
      throw error;
    }
  }

  /**
   * Queue a deployment
   */
  queueDeployment(deployment) {
    this.deploymentQueue.push(deployment);
    console.log(`📦 Deployment queued (${this.deploymentQueue.length} pending)`);
  }

  /**
   * Process deployment queue
   */
  async processDeploymentQueue() {
    if (this.deploymentQueue.length === 0) return;
    
    const deployment = this.deploymentQueue.shift();
    console.log('🚀 Processing deployment...');
    
    try {
      await this.executeDeployment(deployment);
      this.emit('deploymentComplete', deployment);
    } catch (error) {
      console.error('Deployment failed:', error.message);
      this.emit('deploymentFailed', { deployment, error });
    }
  }

  /**
   * Execute deployment to Vercel
   */
  async executeDeployment(deployment) {
    console.log('📡 Triggering Vercel deployment...');
    
    // Wait for GitHub webhook to trigger Vercel (usually 10-30 seconds)
    await this.sleep(15000);
    
    // Check deployment status
    const deploymentStatus = await this.checkVercelDeployment();
    
    if (deploymentStatus.state === 'READY') {
      console.log('✅ Vercel deployment successful');
      await this.updateDNSIfNeeded();
      await this.verifyDeployment();
    } else {
      throw new Error(`Deployment failed: ${deploymentStatus.state}`);
    }
  }

  /**
   * Check Vercel deployment status
   */
  async checkVercelDeployment() {
    try {
      const response = await axios.get(
        `https://api.vercel.com/v6/deployments?projectId=${this.config.vercelProjectId}&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.vercelToken}`
          }
        }
      );
      
      return response.data.deployments[0] || { state: 'NOT_FOUND' };
    } catch (error) {
      console.error('Error checking Vercel deployment:', error.message);
      return { state: 'ERROR' };
    }
  }

  /**
   * Update DNS records if needed
   */
  async updateDNSIfNeeded() {
    if (!this.config.godaddyApiKey) {
      console.log('⚠️ GoDaddy API not configured, skipping DNS update');
      return;
    }
    
    try {
      // Check current DNS records
      const currentRecords = await this.getGoDaddyDNS();
      const needsUpdate = this.checkDNSNeedsUpdate(currentRecords);
      
      if (needsUpdate) {
        await this.updateGoDaddyDNS();
        console.log('✅ DNS records updated');
      } else {
        console.log('✅ DNS records up to date');
      }
    } catch (error) {
      console.error('DNS update error:', error.message);
    }
  }

  /**
   * Verify deployment is working
   */
  async verifyDeployment() {
    const urls = [
      `https://${this.config.domain}`,
      `https://${this.config.domain}/health`,
      `https://${this.config.domain}/api/agents`
    ];
    
    for (const url of urls) {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        console.log(`✅ ${url} - Status: ${response.status}`);
      } catch (error) {
        console.log(`⚠️ ${url} - Error: ${error.message}`);
      }
    }
  }

  /**
   * Run periodic health checks
   */
  async runHealthChecks() {
    // Check every 5 minutes
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    for (const [service, check] of this.healthChecks) {
      if (!check.lastCheck || (now - check.lastCheck) > fiveMinutes) {
        await this.checkServiceHealth(service);
        this.healthChecks.set(service, {
          ...check,
          lastCheck: now
        });
      }
    }
  }

  /**
   * Check individual service health
   */
  async checkServiceHealth(service) {
    try {
      let status = 'healthy';
      
      switch (service) {
        case 'github':
          await this.testGitHubConnection();
          break;
        case 'vercel':
          await this.testVercelConnection();
          break;
        case 'domain':
          await axios.get(`https://${this.config.domain}/health`, { timeout: 5000 });
          break;
        case 'ssl':
          const response = await axios.get(`https://${this.config.domain}`, { timeout: 5000 });
          status = response.request.connection.encrypted ? 'healthy' : 'warning';
          break;
      }
      
      this.healthChecks.get(service).status = status;
    } catch (error) {
      this.healthChecks.get(service).status = 'error';
      console.error(`❌ ${service} health check failed:`, error.message);
    }
  }

  /**
   * Test GitHub API connection
   */
  async testGitHubConnection() {
    const response = await axios.get(`https://api.github.com/repos/${this.config.repository}`, {
      headers: { 'Authorization': `token ${this.config.githubToken}` }
    });
    return response.status === 200;
  }

  /**
   * Test Vercel API connection
   */
  async testVercelConnection() {
    const response = await axios.get('https://api.vercel.com/v2/user', {
      headers: { 'Authorization': `Bearer ${this.config.vercelToken}` }
    });
    return response.status === 200;
  }

  /**
   * Get current GoDaddy DNS records
   */
  async getGoDaddyDNS() {
    if (!this.config.godaddyApiKey) return [];
    
    const response = await axios.get(
      `https://api.godaddy.com/v1/domains/${this.config.domain}/records`,
      {
        headers: {
          'Authorization': `sso-key ${this.config.godaddyApiKey}:${this.config.godaddySecret}`
        }
      }
    );
    
    return response.data;
  }

  /**
   * Update GoDaddy DNS records
   */
  async updateGoDaddyDNS() {
    const records = [
      {
        type: 'CNAME',
        name: '@',
        data: 'cname.vercel-dns.com',
        ttl: 3600
      },
      {
        type: 'CNAME', 
        name: 'www',
        data: 'cname.vercel-dns.com',
        ttl: 3600
      }
    ];
    
    await axios.put(
      `https://api.godaddy.com/v1/domains/${this.config.domain}/records`,
      records,
      {
        headers: {
          'Authorization': `sso-key ${this.config.godaddyApiKey}:${this.config.godaddySecret}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  /**
   * Check if DNS needs updating
   */
  checkDNSNeedsUpdate(records) {
    const cnameRecords = records.filter(r => r.type === 'CNAME');
    const hasCorrectRoot = cnameRecords.some(r => r.name === '@' && r.data === 'cname.vercel-dns.com');
    const hasCorrectWWW = cnameRecords.some(r => r.name === 'www' && r.data === 'cname.vercel-dns.com');
    
    return !hasCorrectRoot || !hasCorrectWWW;
  }

  /**
   * Handle successful deployment
   */
  handleDeploymentComplete(deployment) {
    console.log('🎉 Deployment completed successfully!');
    console.log(`🌐 Live at: https://${this.config.domain}`);
    
    this.lastDeployment = {
      ...deployment,
      status: 'success',
      completedAt: new Date().toISOString()
    };
  }

  /**
   * Handle deployment failure
   */
  handleDeploymentFailure(data) {
    console.error('💥 Deployment failed:', data.error.message);
    
    // Retry logic
    if (data.deployment.retryCount < 3) {
      console.log('🔄 Retrying deployment...');
      setTimeout(() => {
        data.deployment.retryCount = (data.deployment.retryCount || 0) + 1;
        this.queueDeployment(data.deployment);
      }, 60000); // Retry after 1 minute
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      queuedDeployments: this.deploymentQueue.length,
      lastDeployment: this.lastDeployment,
      healthChecks: Object.fromEntries(this.healthChecks),
      uptime: process.uptime()
    };
  }

  /**
   * Stop the agent
   */
  async stop() {
    this.isActive = false;
    console.log('🛑 DevOps Orchestrator Agent stopped');
  }

  // Utility methods
  execAsync(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
      });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DevOpsOrchestratorAgent;