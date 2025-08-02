#!/usr/bin/env node

/**
 * FlashFusion Custom Access Control with JWT Email Authentication
 * Handles role-based access, email verification, and custom JWT claims
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// User roles and permissions
const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator', 
  USER: 'user',
  GUEST: 'guest'
};

const PERMISSIONS = {
  // Admin permissions
  [ROLES.ADMIN]: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'content:create', 'content:read', 'content:update', 'content:delete',
    'system:access', 'analytics:read', 'settings:update'
  ],
  
  // Moderator permissions
  [ROLES.MODERATOR]: [
    'user:read', 'user:update',
    'content:create', 'content:read', 'content:update', 'content:moderate',
    'analytics:read'
  ],
  
  // Regular user permissions
  [ROLES.USER]: [
    'content:create', 'content:read', 'content:update:own',
    'profile:read', 'profile:update:own'
  ],
  
  // Guest permissions
  [ROLES.GUEST]: [
    'content:read:public'
  ]
};

// JWT Utilities
class JWTAuth {
  static generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'flashfusion.co',
      audience: 'flashfusion-users'
    });
  }

  static generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { 
      expiresIn: '7d',
      issuer: 'flashfusion.co'
    });
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error(`Invalid access token: ${error.message}`);
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  static generateEmailVerificationToken(email) {
    const payload = {
      email,
      type: 'email_verification',
      timestamp: Date.now()
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  }

  static verifyEmailToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'email_verification') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error(`Invalid email verification token: ${error.message}`);
    }
  }
}

// Custom Access Control
class AccessControl {
  static hasPermission(userRole, permission, resourceOwner = null, currentUser = null) {
    const userPermissions = PERMISSIONS[userRole] || [];
    
    // Check exact permission
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Check "own" resource permissions
    if (permission.endsWith(':own') && resourceOwner && currentUser) {
      const basePermission = permission.replace(':own', '');
      return userPermissions.includes(basePermission + ':own') && 
             resourceOwner === currentUser;
    }

    // Check public permissions
    if (permission.endsWith(':public')) {
      return userPermissions.includes(permission);
    }

    return false;
  }

  static requirePermission(userRole, permission, resourceOwner = null, currentUser = null) {
    if (!this.hasPermission(userRole, permission, resourceOwner, currentUser)) {
      throw new Error(`Access denied: Missing permission '${permission}'`);
    }
  }

  static getRoleHierarchy(role) {
    const hierarchy = {
      [ROLES.GUEST]: 0,
      [ROLES.USER]: 1,
      [ROLES.MODERATOR]: 2,
      [ROLES.ADMIN]: 3
    };
    return hierarchy[role] || 0;
  }

  static hasMinimumRole(userRole, requiredRole) {
    return this.getRoleHierarchy(userRole) >= this.getRoleHierarchy(requiredRole);
  }
}

// Email-based Authentication
class EmailAuth {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static generateSecureCode(length = 6) {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  static hashEmail(email) {
    return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
  }

  static createEmailBasedSession(email, role = ROLES.USER, additionalClaims = {}) {
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const payload = {
      sub: this.hashEmail(email), // Subject (user identifier)
      email: email.toLowerCase(),
      role,
      permissions: PERMISSIONS[role] || [],
      email_verified: false,
      iat: Math.floor(Date.now() / 1000),
      ...additionalClaims
    };

    const accessToken = JWTAuth.generateAccessToken(payload);
    const refreshToken = JWTAuth.generateRefreshToken({ 
      sub: payload.sub, 
      email: payload.email,
      role: payload.role
    });

    return {
      accessToken,
      refreshToken,
      user: payload,
      expiresIn: JWT_EXPIRES_IN
    };
  }

  static refreshSession(refreshToken) {
    const decoded = JWTAuth.verifyRefreshToken(refreshToken);
    
    // Generate new access token with updated permissions
    const newPayload = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      permissions: PERMISSIONS[decoded.role] || [],
      email_verified: true, // Assume verified on refresh
      iat: Math.floor(Date.now() / 1000)
    };

    const newAccessToken = JWTAuth.generateAccessToken(newPayload);
    
    return {
      accessToken: newAccessToken,
      refreshToken, // Keep same refresh token
      user: newPayload,
      expiresIn: JWT_EXPIRES_IN
    };
  }
}

// Middleware Functions
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const decoded = JWTAuth.verifyAccessToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

export const requireRole = (minimumRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!AccessControl.hasMinimumRole(req.user.role, minimumRole)) {
      return res.status(403).json({ 
        error: `Access denied: Requires ${minimumRole} role or higher` 
      });
    }

    next();
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      AccessControl.requirePermission(
        req.user.role, 
        permission, 
        req.params.userId || req.body.userId,
        req.user.sub
      );
      next();
    } catch (error) {
      return res.status(403).json({ error: error.message });
    }
  };
};

export const requireEmailVerification = (req, res, next) => {
  if (!req.user || !req.user.email_verified) {
    return res.status(403).json({ 
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }
  next();
};

// API Routes Example
export const authRoutes = {
  // Login with email
  async login(email, password = null) {
    if (!EmailAuth.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // In a real app, verify password here
    const role = email.includes('admin') ? ROLES.ADMIN : ROLES.USER;
    
    return EmailAuth.createEmailBasedSession(email, role, {
      login_method: 'email',
      last_login: new Date().toISOString()
    });
  },

  // Email verification
  async verifyEmail(token) {
    const decoded = JWTAuth.verifyEmailToken(token);
    
    // Mark email as verified in database
    // Update user session with email_verified: true
    
    return {
      success: true,
      email: decoded.email,
      message: 'Email verified successfully'
    };
  },

  // Refresh token
  async refresh(refreshToken) {
    return EmailAuth.refreshSession(refreshToken);
  },

  // Update user role (admin only)
  async updateUserRole(targetEmail, newRole, adminUser) {
    AccessControl.requirePermission(adminUser.role, 'user:update');
    
    if (!Object.values(ROLES).includes(newRole)) {
      throw new Error('Invalid role');
    }

    // Update role in database
    // Return new session if needed
    
    return {
      success: true,
      message: `User ${targetEmail} role updated to ${newRole}`
    };
  }
};

// Export classes and utilities
export { 
  JWTAuth, 
  AccessControl, 
  EmailAuth, 
  ROLES, 
  PERMISSIONS 
};

// CLI Testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔐 FlashFusion Custom Access Control Test\n');
  
  try {
    // Test email-based session
    const session = EmailAuth.createEmailBasedSession('user@flashfusion.co', ROLES.USER);
    console.log('✅ Created session:', {
      email: session.user.email,
      role: session.user.role,
      permissions: session.user.permissions.slice(0, 3) + '...'
    });

    // Test token verification
    const verified = JWTAuth.verifyAccessToken(session.accessToken);
    console.log('✅ Token verified:', verified.email);

    // Test permissions
    const hasPermission = AccessControl.hasPermission(ROLES.USER, 'content:create');
    console.log('✅ Permission check (content:create):', hasPermission);

    // Test email verification token
    const emailToken = JWTAuth.generateEmailVerificationToken('test@flashfusion.co');
    console.log('✅ Email verification token generated');

    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}