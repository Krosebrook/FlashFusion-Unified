/**
 * PERMANENT FIX FOR VERCEL DEPLOYMENT
 * This logger NEVER uses file system operations
 * It will NEVER crash on Vercel or any read-only environment
 */

// Use the universal logger that works everywhere
const universalLogger = require('./universalLogger');

// Export the universal logger
module.exports = universalLogger;

// Maintain consistent export - don't override module.exports
if (process.env.VERCEL || process.env.NOW_REGION) {
    // On Vercel, the universal logger already handles this safely
    console.log('Running on Vercel - using universal logger');
}