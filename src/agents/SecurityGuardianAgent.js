/**
 * Security Guardian Agent
 * Autonomous agent that secures and monitors the FlashFusion infrastructure:
 * - Supabase RLS policies and security
 * - API key rotation and management
 * - Vulnerability scanning and patching
 * - Access monitoring and threat detection
 */

const { EventEmitter } = require('events');
const { exec } = require('child_process');
const fs = require('fs').promises;
const axios = require('axios');
const crypto = require('crypto');

class SecurityGuardianAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      githubToken: process.env.GITHUB_TOKEN,
      notionApiKey: process.env.NOTION_API_KEY,
      zapierWebhook: process.env.ZAPIER_WEBHOOK_URL,
      keyRotationDays: 30,
      vulnerabilityScanHours: 24,
      accessMonitoringMinutes: 15,
      ...config
    };
    
    this.isActive = false;
    this.securityEvents = [];
    this.keyRotationSchedule = new Map();
    this.vulnerabilityReport = null;
    this.accessLogs = [];
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.on('securityThreat', this.handleSecurityThreat.bind(this));
    this.on('keyRotationDue', this.handleKeyRotation.bind(this));
    this.on('vulnerabilityFound', this.handleVulnerability.bind(this));
    this.on('unauthorizedAccess', this.handleUnauthorizedAccess.bind(this));
  }

  /**
   * Start the Security Guardian Agent
   */
  async start() {
    console.log('🛡️ Starting Security Guardian Agent...');
    
    try {
      await this.validateConfiguration();
      await this.initializeSupabaseSecurity();
      await this.setupKeyRotationSchedule();
      await this.initializeAccessMonitoring();
      
      this.isActive = true;
      console.log('✅ Security Guardian Agent active');
      
      // Start security monitoring loops
      this.startSecurityMonitoring();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to start Security Guardian:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate security configuration
   */
  async validateConfiguration() {
    console.log('🔍 Validating security configuration...');
    
    const required = ['supabaseUrl', 'supabaseServiceKey'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing security config: ${missing.join(', ')}`);
    }
    
    // Test Supabase connection
    await this.testSupabaseConnection();
    
    console.log('✅ Security configuration validated');
  }

  /**
   * Initialize Supabase security policies
   */
  async initializeSupabaseSecurity() {
    console.log('🔐 Initializing Supabase security...');
    
    try {
      // Enable RLS on all tables
      await this.enableRowLevelSecurity();
      
      // Create security policies
      await this.createSecurityPolicies();
      
      // Setup audit logging
      await this.setupAuditLogging();
      
      // Configure API rate limiting
      await this.configureRateLimiting();
      
      console.log('✅ Supabase security initialized');
    } catch (error) {
      console.error('⚠️ Supabase security setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Enable Row Level Security on all tables
   */
  async enableRowLevelSecurity() {
    const tables = await this.getSupabaseTables();
    
    for (const table of tables) {
      try {
        await this.supabaseQuery(`ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;`);
        console.log(`✅ RLS enabled on ${table.name}`);
      } catch (error) {
        console.log(`⚠️ RLS already enabled on ${table.name}`);
      }
    }
  }

  /**
   * Create comprehensive security policies
   */
  async createSecurityPolicies() {
    const policies = [
      // User data access policy
      {
        name: 'users_own_data_policy',
        table: 'users',
        query: `
          CREATE POLICY users_own_data_policy ON users 
          FOR ALL USING (auth.uid() = id);
        `
      },
      
      // Agent access policy
      {
        name: 'agents_authenticated_policy', 
        table: 'agents',
        query: `
          CREATE POLICY agents_authenticated_policy ON agents
          FOR SELECT USING (auth.role() = 'authenticated');
        `
      },
      
      // Workflow security policy
      {
        name: 'workflows_owner_policy',
        table: 'workflows', 
        query: `
          CREATE POLICY workflows_owner_policy ON workflows
          FOR ALL USING (auth.uid() = user_id);
        `
      },
      
      // API keys security policy
      {
        name: 'api_keys_admin_policy',
        table: 'api_keys',
        query: `
          CREATE POLICY api_keys_admin_policy ON api_keys
          FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
        `
      }
    ];
    
    for (const policy of policies) {
      try {
        await this.supabaseQuery(policy.query);
        console.log(`✅ Policy created: ${policy.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ Policy exists: ${policy.name}`);
        } else {
          console.error(`❌ Policy failed: ${policy.name}`, error.message);
        }
      }
    }
  }

  /**
   * Setup audit logging for security events
   */
  async setupAuditLogging() {
    const auditTableQuery = `
      CREATE TABLE IF NOT EXISTS security_audit_log (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        event_type TEXT NOT NULL,
        user_id UUID,
        ip_address INET,
        user_agent TEXT,
        resource TEXT,
        action TEXT,
        success BOOLEAN,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable RLS on audit log
      ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
      
      -- Only admins can read audit logs
      CREATE POLICY audit_log_admin_policy ON security_audit_log
        FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
      
      -- Create audit function
      CREATE OR REPLACE FUNCTION log_security_event(
        p_event_type TEXT,
        p_user_id UUID DEFAULT NULL,
        p_resource TEXT DEFAULT NULL,
        p_action TEXT DEFAULT NULL,
        p_success BOOLEAN DEFAULT TRUE,
        p_metadata JSONB DEFAULT '{}'::jsonb
      ) RETURNS UUID AS $$
      DECLARE
        audit_id UUID;
      BEGIN
        INSERT INTO security_audit_log (
          event_type, user_id, ip_address, user_agent, resource, action, success, metadata
        ) VALUES (
          p_event_type, p_user_id, inet_client_addr(), 
          current_setting('request.headers', true)::jsonb ->> 'user-agent',
          p_resource, p_action, p_success, p_metadata
        ) RETURNING id INTO audit_id;
        
        RETURN audit_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    await this.supabaseQuery(auditTableQuery);
    console.log('✅ Audit logging configured');
  }

  /**
   * Configure API rate limiting
   */
  async configureRateLimiting() {
    const rateLimitQuery = `
      -- Create rate limiting table
      CREATE TABLE IF NOT EXISTS rate_limits (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        identifier TEXT NOT NULL, -- IP or user ID
        endpoint TEXT NOT NULL,
        requests INTEGER DEFAULT 0,
        window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(identifier, endpoint)
      );
      
      -- Function to check rate limits
      CREATE OR REPLACE FUNCTION check_rate_limit(
        p_identifier TEXT,
        p_endpoint TEXT,
        p_limit INTEGER DEFAULT 100,
        p_window_minutes INTEGER DEFAULT 60
      ) RETURNS BOOLEAN AS $$
      DECLARE
        current_requests INTEGER;
        window_start TIMESTAMP WITH TIME ZONE;
      BEGIN
        -- Get current window data
        SELECT requests, window_start INTO current_requests, window_start
        FROM rate_limits 
        WHERE identifier = p_identifier AND endpoint = p_endpoint;
        
        -- If no record exists, create one
        IF NOT FOUND THEN
          INSERT INTO rate_limits (identifier, endpoint, requests)
          VALUES (p_identifier, p_endpoint, 1);
          RETURN TRUE;
        END IF;
        
        -- Check if window has expired
        IF window_start < NOW() - INTERVAL '1 minute' * p_window_minutes THEN
          UPDATE rate_limits 
          SET requests = 1, window_start = NOW()
          WHERE identifier = p_identifier AND endpoint = p_endpoint;
          RETURN TRUE;
        END IF;
        
        -- Check if limit exceeded
        IF current_requests >= p_limit THEN
          RETURN FALSE;
        END IF;
        
        -- Increment counter
        UPDATE rate_limits 
        SET requests = requests + 1
        WHERE identifier = p_identifier AND endpoint = p_endpoint;
        
        RETURN TRUE;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await this.supabaseQuery(rateLimitQuery);
    console.log('✅ Rate limiting configured');
  }

  /**
   * Setup API key rotation schedule
   */
  async setupKeyRotationSchedule() {
    console.log('🔑 Setting up key rotation schedule...');
    
    const apiKeys = [
      { name: 'ANTHROPIC_API_KEY', service: 'anthropic', rotationDays: 30 },
      { name: 'OPENAI_API_KEY', service: 'openai', rotationDays: 45 },
      { name: 'GITHUB_TOKEN', service: 'github', rotationDays: 90 },
      { name: 'NOTION_API_KEY', service: 'notion', rotationDays: 60 }
    ];
    
    for (const key of apiKeys) {
      const lastRotation = await this.getLastKeyRotation(key.name);
      const nextRotation = new Date(Date.now() + (key.rotationDays * 24 * 60 * 60 * 1000));
      
      if (!lastRotation || this.isKeyRotationDue(lastRotation, key.rotationDays)) {
        this.keyRotationSchedule.set(key.name, {
          ...key,
          nextRotation: nextRotation,
          status: 'due'
        });
      } else {
        this.keyRotationSchedule.set(key.name, {
          ...key,
          nextRotation: nextRotation,
          status: 'scheduled'
        });
      }
    }
    
    console.log(`✅ Key rotation scheduled for ${apiKeys.length} services`);
  }

  /**
   * Initialize access monitoring
   */
  async initializeAccessMonitoring() {
    console.log('👁️ Initializing access monitoring...');
    
    // Create monitoring webhook endpoint
    await this.setupAccessWebhook();
    
    // Initialize threat detection patterns
    this.threatPatterns = [
      { pattern: /sql injection/i, severity: 'high' },
      { pattern: /xss|script/i, severity: 'medium' },
      { pattern: /unauthorized/i, severity: 'high' },
      { pattern: /brute.?force/i, severity: 'high' },
      { pattern: /ddos|flood/i, severity: 'critical' }
    ];
    
    console.log('✅ Access monitoring initialized');
  }

  /**
   * Start security monitoring loops
   */
  startSecurityMonitoring() {
    // Vulnerability scanning (daily)
    setInterval(async () => {
      if (this.isActive) await this.runVulnerabilityScans();
    }, 24 * 60 * 60 * 1000);
    
    // Key rotation check (daily)
    setInterval(async () => {
      if (this.isActive) await this.checkKeyRotations();
    }, 24 * 60 * 60 * 1000);
    
    // Access monitoring (every 15 minutes)
    setInterval(async () => {
      if (this.isActive) await this.monitorAccess();
    }, 15 * 60 * 1000);
    
    // Security metrics (every hour)
    setInterval(async () => {
      if (this.isActive) await this.generateSecurityMetrics();
    }, 60 * 60 * 1000);
    
    console.log('🔄 Security monitoring loops started');
  }

  /**
   * Run comprehensive vulnerability scans
   */
  async runVulnerabilityScans() {
    console.log('🔍 Running vulnerability scans...');
    
    try {
      // Scan dependencies
      const depScan = await this.scanDependencies();
      
      // Scan Supabase configuration
      const dbScan = await this.scanDatabaseSecurity();
      
      // Scan API endpoints
      const apiScan = await this.scanApiSecurity();
      
      // Scan environment configuration
      const envScan = await this.scanEnvironmentSecurity();
      
      this.vulnerabilityReport = {
        timestamp: new Date().toISOString(),
        dependencies: depScan,
        database: dbScan,
        api: apiScan,
        environment: envScan,
        summary: this.summarizeVulnerabilities([depScan, dbScan, apiScan, envScan])
      };
      
      // Handle critical vulnerabilities
      if (this.vulnerabilityReport.summary.critical > 0) {
        this.emit('vulnerabilityFound', this.vulnerabilityReport);
      }
      
      console.log(`✅ Vulnerability scan complete: ${this.vulnerabilityReport.summary.total} issues found`);
      
    } catch (error) {
      console.error('❌ Vulnerability scan failed:', error.message);
    }
  }

  /**
   * Scan dependencies for vulnerabilities
   */
  async scanDependencies() {
    try {
      const { stdout } = await this.execAsync('npm audit --json');
      const auditResult = JSON.parse(stdout);
      
      return {
        total: auditResult.metadata?.vulnerabilities?.total || 0,
        critical: auditResult.metadata?.vulnerabilities?.critical || 0,
        high: auditResult.metadata?.vulnerabilities?.high || 0,
        moderate: auditResult.metadata?.vulnerabilities?.moderate || 0,
        low: auditResult.metadata?.vulnerabilities?.low || 0,
        details: auditResult.vulnerabilities
      };
    } catch (error) {
      return { total: 0, error: error.message };
    }
  }

  /**
   * Scan database security configuration
   */
  async scanDatabaseSecurity() {
    const issues = [];
    
    try {
      // Check RLS status
      const tables = await this.getSupabaseTables();
      for (const table of tables) {
        const rlsStatus = await this.checkRLSStatus(table.name);
        if (!rlsStatus.enabled) {
          issues.push({
            severity: 'high',
            type: 'missing_rls',
            table: table.name,
            message: 'Row Level Security not enabled'
          });
        }
      }
      
      // Check for default passwords
      const weakPasswords = await this.checkWeakPasswords();
      issues.push(...weakPasswords);
      
      // Check policy coverage
      const policyGaps = await this.checkPolicyGaps();
      issues.push(...policyGaps);
      
    } catch (error) {
      issues.push({
        severity: 'high',
        type: 'scan_error',
        message: `Database scan failed: ${error.message}`
      });
    }
    
    return {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      issues: issues
    };
  }

  /**
   * Check key rotations
   */
  async checkKeyRotations() {
    console.log('🔑 Checking key rotations...');
    
    for (const [keyName, schedule] of this.keyRotationSchedule) {
      if (schedule.status === 'due' || new Date() >= schedule.nextRotation) {
        console.log(`⚠️ Key rotation due: ${keyName}`);
        this.emit('keyRotationDue', { keyName, schedule });
      }
    }
  }

  /**
   * Handle key rotation
   */
  async handleKeyRotation(data) {
    console.log(`🔄 Rotating key: ${data.keyName}`);
    
    try {
      const newKey = await this.rotateApiKey(data.keyName, data.schedule.service);
      
      if (newKey) {
        // Update environment
        await this.updateEnvironmentKey(data.keyName, newKey);
        
        // Log rotation
        await this.logSecurityEvent('key_rotation', {
          keyName: data.keyName,
          service: data.schedule.service,
          success: true
        });
        
        // Update schedule
        const nextRotation = new Date(Date.now() + (data.schedule.rotationDays * 24 * 60 * 60 * 1000));
        this.keyRotationSchedule.set(data.keyName, {
          ...data.schedule,
          nextRotation: nextRotation,
          status: 'scheduled',
          lastRotation: new Date().toISOString()
        });
        
        console.log(`✅ Key rotated successfully: ${data.keyName}`);
      }
      
    } catch (error) {
      console.error(`❌ Key rotation failed: ${data.keyName}`, error.message);
      
      await this.logSecurityEvent('key_rotation_failed', {
        keyName: data.keyName,
        error: error.message,
        success: false
      });
    }
  }

  /**
   * Monitor access patterns
   */
  async monitorAccess() {
    try {
      // Get recent access logs from Supabase
      const accessLogs = await this.getRecentAccessLogs();
      
      // Analyze for suspicious patterns
      const threats = this.analyzeThreatPatterns(accessLogs);
      
      if (threats.length > 0) {
        console.log(`⚠️ ${threats.length} potential threats detected`);
        
        for (const threat of threats) {
          this.emit('securityThreat', threat);
        }
      }
      
      // Store logs for analysis
      this.accessLogs = [...this.accessLogs, ...accessLogs].slice(-1000); // Keep last 1000
      
    } catch (error) {
      console.error('❌ Access monitoring failed:', error.message);
    }
  }

  /**
   * Handle security threats
   */
  async handleSecurityThreat(threat) {
    console.log(`🚨 Security threat detected: ${threat.type}`);
    
    // Log the threat
    await this.logSecurityEvent('threat_detected', threat);
    
    // Auto-response based on severity
    switch (threat.severity) {
      case 'critical':
        await this.handleCriticalThreat(threat);
        break;
      case 'high':
        await this.handleHighThreat(threat);
        break;
      default:
        await this.handleMediumThreat(threat);
    }
  }

  /**
   * Handle critical threats (immediate action)
   */
  async handleCriticalThreat(threat) {
    // Block IP if possible
    if (threat.ip) {
      await this.blockIP(threat.ip);
    }
    
    // Send immediate alert
    await this.sendSecurityAlert(threat, 'CRITICAL');
    
    // Auto-rotate potentially compromised keys
    await this.emergencyKeyRotation();
  }

  /**
   * Generate security metrics
   */
  async generateSecurityMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      threats: {
        total: this.securityEvents.length,
        last24h: this.securityEvents.filter(e => 
          new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      },
      keyRotations: {
        scheduled: Array.from(this.keyRotationSchedule.values()).filter(s => s.status === 'scheduled').length,
        due: Array.from(this.keyRotationSchedule.values()).filter(s => s.status === 'due').length
      },
      vulnerabilities: this.vulnerabilityReport?.summary || { total: 0 },
      accessLogs: {
        total: this.accessLogs.length,
        uniqueIPs: new Set(this.accessLogs.map(log => log.ip)).size
      }
    };
    
    // Store metrics
    await this.storeSecurityMetrics(metrics);
    
    return metrics;
  }

  /**
   * Get security status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      lastVulnerabilityScan: this.vulnerabilityReport?.timestamp,
      keyRotationSchedule: Object.fromEntries(this.keyRotationSchedule),
      recentThreats: this.securityEvents.slice(-10),
      uptime: process.uptime()
    };
  }

  // Utility methods
  async testSupabaseConnection() {
    const response = await axios.get(`${this.config.supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': this.config.supabaseServiceKey,
        'Authorization': `Bearer ${this.config.supabaseServiceKey}`
      }
    });
    return response.status === 200;
  }

  async supabaseQuery(query) {
    const response = await axios.post(`${this.config.supabaseUrl}/rest/v1/rpc/exec_sql`, 
      { query },
      {
        headers: {
          'apikey': this.config.supabaseServiceKey,
          'Authorization': `Bearer ${this.config.supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  async getSupabaseTables() {
    // Simplified - in practice, query information_schema
    return [
      { name: 'users' },
      { name: 'agents' },
      { name: 'workflows' },
      { name: 'api_keys' }
    ];
  }

  async logSecurityEvent(eventType, data) {
    const event = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType,
      data
    };
    
    this.securityEvents.push(event);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
  }

  execAsync(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
      });
    });
  }

  /**
   * Stop the agent
   */
  async stop() {
    this.isActive = false;
    console.log('🛑 Security Guardian Agent stopped');
  }
}

module.exports = SecurityGuardianAgent;