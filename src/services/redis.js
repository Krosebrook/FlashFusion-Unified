import redis from 'redis';
import { promisify } from 'util';

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionError = null;
        this.retryAttempts = 0;
        this.maxRetries = 5;
        this.retryDelay = 1000; // 1 second
    }

    async initialize() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            
            // Parse Redis URL for additional options
            const url = new URL(redisUrl);
            const password = url.password;
            
            this.client = redis.createClient({
                url: redisUrl,
                socket: {
                    connectTimeout: 10000,
                    lazyConnect: true,
                    reconnectStrategy: (retries) => {
                        if (retries > this.maxRetries) {
                            console.error('Redis connection failed after max retries');
                            return false;
                        }
                        return Math.min(retries * this.retryDelay, 30000);
                    }
                },
                password: password || process.env.REDIS_PASSWORD,
                database: parseInt(url.searchParams.get('db') || '0'),
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        console.error('Redis server refused connection');
                        return new Error('Redis server refused connection');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        return new Error('Retry time exhausted');
                    }
                    if (options.attempt > this.maxRetries) {
                        return undefined;
                    }
                    return Math.min(options.attempt * this.retryDelay, 30000);
                }
            });

            // Event handlers
            this.client.on('connect', () => {
                console.log('🔄 Connecting to Redis...');
            });

            this.client.on('ready', () => {
                this.isConnected = true;
                this.connectionError = null;
                this.retryAttempts = 0;
                console.log('✅ Redis connected successfully');
            });

            this.client.on('error', (err) => {
                this.isConnected = false;
                this.connectionError = err.message;
                console.error('❌ Redis connection error:', err.message);
            });

            this.client.on('reconnecting', () => {
                console.log('🔄 Redis reconnecting...');
            });

            this.client.on('end', () => {
                this.isConnected = false;
                console.log('🔌 Redis connection ended');
            });

            // Connect to Redis
            await this.client.connect();
            
            // Test connection
            await this.client.ping();
            
            return true;
        } catch (error) {
            this.connectionError = error.message;
            this.isConnected = false;
            console.warn('⚠️ Redis connection failed:', error.message);
            console.warn('   Application will run without Redis caching');
            return false;
        }
    }

    // Basic operations with error handling
    async get(key) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error('Redis GET error:', error.message);
            throw error;
        }
    }

    async set(key, value, ttl = null) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            if (ttl) {
                return await this.client.setEx(key, ttl, value);
            } else {
                return await this.client.set(key, value);
            }
        } catch (error) {
            console.error('Redis SET error:', error.message);
            throw error;
        }
    }

    async setEx(key, ttl, value) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.setEx(key, ttl, value);
        } catch (error) {
            console.error('Redis SETEX error:', error.message);
            throw error;
        }
    }

    async del(key) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.del(key);
        } catch (error) {
            console.error('Redis DEL error:', error.message);
            throw error;
        }
    }

    async exists(key) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.exists(key);
        } catch (error) {
            console.error('Redis EXISTS error:', error.message);
            throw error;
        }
    }

    async expire(key, ttl) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.expire(key, ttl);
        } catch (error) {
            console.error('Redis EXPIRE error:', error.message);
            throw error;
        }
    }

    // Hash operations
    async hGet(key, field) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.hGet(key, field);
        } catch (error) {
            console.error('Redis HGET error:', error.message);
            throw error;
        }
    }

    async hSet(key, field, value) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.hSet(key, field, value);
        } catch (error) {
            console.error('Redis HSET error:', error.message);
            throw error;
        }
    }

    async hGetAll(key) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.hGetAll(key);
        } catch (error) {
            console.error('Redis HGETALL error:', error.message);
            throw error;
        }
    }

    async hDel(key, field) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.hDel(key, field);
        } catch (error) {
            console.error('Redis HDEL error:', error.message);
            throw error;
        }
    }

    // List operations
    async lPush(key, value) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.lPush(key, value);
        } catch (error) {
            console.error('Redis LPUSH error:', error.message);
            throw error;
        }
    }

    async rPop(key) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.rPop(key);
        } catch (error) {
            console.error('Redis RPOP error:', error.message);
            throw error;
        }
    }

    async lRange(key, start, stop) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.lRange(key, start, stop);
        } catch (error) {
            console.error('Redis LRANGE error:', error.message);
            throw error;
        }
    }

    // Set operations
    async sAdd(key, member) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.sAdd(key, member);
        } catch (error) {
            console.error('Redis SADD error:', error.message);
            throw error;
        }
    }

    async sMembers(key) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.sMembers(key);
        } catch (error) {
            console.error('Redis SMEMBERS error:', error.message);
            throw error;
        }
    }

    async sRem(key, member) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.sRem(key, member);
        } catch (error) {
            console.error('Redis SREM error:', error.message);
            throw error;
        }
    }

    // Utility methods
    async ping() {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.ping();
        } catch (error) {
            console.error('Redis PING error:', error.message);
            throw error;
        }
    }

    async flushDb() {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.flushDb();
        } catch (error) {
            console.error('Redis FLUSHDB error:', error.message);
            throw error;
        }
    }

    async info() {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        
        try {
            return await this.client.info();
        } catch (error) {
            console.error('Redis INFO error:', error.message);
            throw error;
        }
    }

    // Security: Token blacklisting
    async blacklistToken(token, ttl = 3600) {
        try {
            return await this.setEx(`blacklist:${token}`, ttl, 'revoked');
        } catch (error) {
            console.error('Token blacklisting failed:', error.message);
            throw error;
        }
    }

    async isTokenBlacklisted(token) {
        try {
            return await this.exists(`blacklist:${token}`);
        } catch (error) {
            console.error('Token blacklist check failed:', error.message);
            return false; // Fail safe - don't block if Redis is down
        }
    }

    // Rate limiting
    async incrementRateLimit(key, window = 3600) {
        try {
            const current = await this.get(key);
            const count = current ? parseInt(current) : 0;
            await this.setEx(key, window, (count + 1).toString());
            return count + 1;
        } catch (error) {
            console.error('Rate limit increment failed:', error.message);
            return 0; // Fail safe
        }
    }

    async getRateLimit(key) {
        try {
            const current = await this.get(key);
            return current ? parseInt(current) : 0;
        } catch (error) {
            console.error('Rate limit check failed:', error.message);
            return 0; // Fail safe
        }
    }

    // Health check
    async healthCheck() {
        try {
            const start = Date.now();
            await this.ping();
            const responseTime = Date.now() - start;
            
            return {
                status: 'healthy',
                responseTime,
                connected: this.isConnected,
                error: this.connectionError
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                responseTime: 0,
                connected: false,
                error: error.message
            };
        }
    }

    // Cleanup
    async disconnect() {
        if (this.client) {
            try {
                await this.client.quit();
                console.log('🔌 Redis disconnected gracefully');
            } catch (error) {
                console.error('Redis disconnect error:', error.message);
            }
        }
    }

    getConnectionStatus() {
        return {
            connected: this.isConnected,
            error: this.connectionError,
            retryAttempts: this.retryAttempts
        };
    }
}

// Create singleton instance
const redisService = new RedisService();

// Initialize on module load
redisService.initialize().catch(error => {
    console.error('Failed to initialize Redis service:', error.message);
});

export default redisService; 