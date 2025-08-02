#!/usr/bin/env node

/**
 * FlashFusion API Key Generator
 * Generates secure API keys for FlashFusion users
 */

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// API Key patterns for FlashFusion
const API_KEY_PATTERNS = {
  flashfusion: 'ff_',     // FlashFusion API keys
  webhook: 'wh_',         // Webhook signing keys  
  internal: 'int_',       // Internal service keys
  public: 'pk_',          // Public keys (safe for frontend)
  secret: 'sk_',          // Secret keys (server-side only)
  test: 'test_',          // Test environment keys
  live: 'live_'           // Production keys
};

class APIKeyGenerator {
  /**
   * Generate a secure API key
   * @param {string} prefix - Key prefix (ff_, wh_, etc.)
   * @param {number} length - Key length (default: 32)
   * @returns {string} Generated API key
   */
  static generate(prefix = 'ff_', length = 32) {
    const randomBytes = crypto.randomBytes(length);
    const key = randomBytes.toString('base64url').substring(0, length);
    return `${prefix}${key}`;
  }

  /**
   * Generate multiple API keys for a user
   * @param {string} userId - User identifier
   * @param {string} environment - 'test' or 'live'
   * @returns {object} Set of API keys
   */
  static generateUserKeys(userId, environment = 'test') {
    const prefix = environment === 'live' ? 'live_' : 'test_';
    
    return {
      // Public key (safe for frontend)
      publicKey: this.generate(`pk_${prefix}`, 32),
      
      // Secret key (server-side only)
      secretKey: this.generate(`sk_${prefix}`, 48),
      
      // Webhook signing key
      webhookKey: this.generate(`wh_${prefix}`, 32),
      
      // API key metadata
      metadata: {
        userId,
        environment,
        createdAt: new Date().toISOString(),
        keyId: crypto.randomUUID(),
        permissions: ['read', 'write', 'deploy']
      }
    };
  }

  /**
   * Generate internal service keys
   * @param {string} serviceName - Name of the service
   * @returns {object} Service API keys
   */
  static generateServiceKeys(serviceName) {
    return {
      // Internal service key
      internalKey: this.generate('int_', 40),
      
      // Service webhook key
      webhookKey: this.generate('wh_', 32),
      
      // Service metadata
      metadata: {
        serviceName,
        createdAt: new Date().toISOString(),
        keyId: crypto.randomUUID(),
        permissions: ['internal', 'webhook', 'admin']
      }
    };
  }

  /**
   * Generate JWT secrets for authentication
   * @returns {object} JWT secrets
   */
  static generateJWTSecrets() {
    return {
      jwtSecret: crypto.randomBytes(64).toString('hex'),
      jwtRefreshSecret: crypto.randomBytes(64).toString('hex'),
      sessionSecret: crypto.randomBytes(32).toString('hex'),
      cookieSecret: crypto.randomBytes(32).toString('hex'),
      encryptionKey: crypto.randomBytes(32).toString('hex').substring(0, 32)
    };
  }

  /**
   * Validate API key format
   * @param {string} apiKey - API key to validate
   * @returns {object} Validation result
   */
  static validate(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return { valid: false, error: 'API key must be a string' };
    }

    const parts = apiKey.split('_');
    if (parts.length < 2) {
      return { valid: false, error: 'Invalid API key format' };
    }

    const prefix = parts[0] + '_';
    const key = parts.slice(1).join('_');

    const validPrefixes = Object.values(API_KEY_PATTERNS);
    if (!validPrefixes.some(p => apiKey.startsWith(p))) {
      return { valid: false, error: 'Invalid API key prefix' };
    }

    if (key.length < 16) {
      return { valid: false, error: 'API key too short' };
    }

    return {
      valid: true,
      prefix,
      keyLength: key.length,
      type: this.getKeyType(prefix)
    };
  }

  /**
   * Get key type from prefix
   * @param {string} prefix - Key prefix
   * @returns {string} Key type
   */
  static getKeyType(prefix) {
    const typeMap = {
      'pk_': 'public',
      'sk_': 'secret', 
      'wh_': 'webhook',
      'int_': 'internal',
      'ff_': 'flashfusion',
      'test_': 'test',
      'live_': 'live'
    };

    return typeMap[prefix] || 'unknown';
  }

  /**
   * Encrypt API key for storage
   * @param {string} apiKey - API key to encrypt
   * @param {string} encryptionKey - Encryption key
   * @returns {string} Encrypted API key
   */
  static encrypt(apiKey, encryptionKey) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, encryptionKey);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Hash API key for comparison (one-way)
   * @param {string} apiKey - API key to hash
   * @returns {string} Hashed API key
   */
  static hash(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
}

// CLI Interface
function displayHelp() {
  console.log(`
🔑 FlashFusion API Key Generator

Usage:
  node generate-api-keys.js [command] [options]

Commands:
  user <userId>     Generate user API keys
  service <name>    Generate service API keys  
  jwt              Generate JWT secrets
  validate <key>   Validate API key format
  help             Show this help

Examples:
  node generate-api-keys.js user user123
  node generate-api-keys.js service github-integration
  node generate-api-keys.js jwt
  node generate-api-keys.js validate ff_abc123def456
`);
}

async function main() {
  const [,, command, ...args] = process.argv;

  switch (command) {
    case 'user': {
      const userId = args[0] || 'user_' + Date.now();
      const environment = args[1] || 'test';
      
      console.log('👤 Generating User API Keys\n');
      const keys = APIKeyGenerator.generateUserKeys(userId, environment);
      
      console.log('📋 Generated Keys:');
      console.log(`   Public Key:  ${keys.publicKey}`);
      console.log(`   Secret Key:  ${keys.secretKey}`);
      console.log(`   Webhook Key: ${keys.webhookKey}`);
      console.log(`   Key ID:      ${keys.metadata.keyId}`);
      console.log(`   Environment: ${keys.metadata.environment}`);
      
      console.log('\n💾 Add to your .env:');
      console.log(`FLASHFUSION_PUBLIC_KEY=${keys.publicKey}`);
      console.log(`FLASHFUSION_SECRET_KEY=${keys.secretKey}`);
      console.log(`FLASHFUSION_WEBHOOK_KEY=${keys.webhookKey}`);
      break;
    }

    case 'service': {
      const serviceName = args[0] || 'unknown-service';
      
      console.log('🔧 Generating Service API Keys\n');
      const keys = APIKeyGenerator.generateServiceKeys(serviceName);
      
      console.log('📋 Generated Keys:');
      console.log(`   Internal Key: ${keys.internalKey}`);
      console.log(`   Webhook Key:  ${keys.webhookKey}`);
      console.log(`   Service:      ${keys.metadata.serviceName}`);
      console.log(`   Key ID:       ${keys.metadata.keyId}`);
      break;
    }

    case 'jwt': {
      console.log('🔐 Generating JWT Secrets\n');
      const secrets = APIKeyGenerator.generateJWTSecrets();
      
      console.log('📋 Generated Secrets:');
      console.log(`   JWT Secret:         ${secrets.jwtSecret}`);
      console.log(`   JWT Refresh Secret: ${secrets.jwtRefreshSecret}`);
      console.log(`   Session Secret:     ${secrets.sessionSecret}`);
      console.log(`   Cookie Secret:      ${secrets.cookieSecret}`);
      console.log(`   Encryption Key:     ${secrets.encryptionKey}`);
      
      console.log('\n💾 Add to your .env:');
      console.log(`JWT_SECRET=${secrets.jwtSecret}`);
      console.log(`JWT_REFRESH_SECRET=${secrets.jwtRefreshSecret}`);
      console.log(`SESSION_SECRET=${secrets.sessionSecret}`);
      console.log(`COOKIE_SECRET=${secrets.cookieSecret}`);
      console.log(`ENCRYPTION_KEY=${secrets.encryptionKey}`);
      break;
    }

    case 'validate': {
      const apiKey = args[0];
      if (!apiKey) {
        console.log('❌ Please provide an API key to validate');
        break;
      }
      
      console.log('🔍 Validating API Key\n');
      const result = APIKeyGenerator.validate(apiKey);
      
      if (result.valid) {
        console.log('✅ Valid API Key');
        console.log(`   Type:   ${result.type}`);
        console.log(`   Prefix: ${result.prefix}`);
        console.log(`   Length: ${result.keyLength}`);
      } else {
        console.log('❌ Invalid API Key');
        console.log(`   Error: ${result.error}`);
      }
      break;
    }

    case 'help':
    default:
      displayHelp();
      break;
  }
}

// Export for use as module
export { APIKeyGenerator };

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}