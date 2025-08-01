import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import redisClient from '../services/redis.js';

const verify = promisify(jwt.verify);

export async function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    const payload = await verify(token, process.env.JWT_SECRET);
    
    // Validate token hasn't expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({ error: 'Token has expired' });
    }

    req.user = payload;
    req.token = token;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function signJwt(payload, options = {}) {
  const defaultOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    issuer: 'flashfusion-unified',
    audience: 'flashfusion-api'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    ...defaultOptions,
    ...options
  });
}

export async function revokeToken(token) {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      // Store in blacklist until token would naturally expire
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisClient.setex(`blacklist:${token}`, ttl, 'revoked');
      }
    }
  } catch (error) {
    console.error('Failed to revoke token:', error.message);
  }
}

export function refreshToken(req, res, next) {
  // Middleware to handle token refresh
  const { user, token } = req;
  
  if (user && token) {
    const decoded = jwt.decode(token);
    const timeUntilExp = decoded.exp - Math.floor(Date.now() / 1000);
    
    // If token expires within 1 hour, issue a new one
    if (timeUntilExp < 3600) {
      const newToken = signJwt({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      res.setHeader('X-New-Token', newToken);
    }
  }
  
  next();
}