// Cache Service - Handles Vultr Valkey (Redis) operations
const {
    createRedisClient
} = require('../config/vultr');

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    /**
     * Initialize Redis connection
     */
    async connect() {
        if (this.isConnected) return;

        try {
            this.client = createRedisClient();
            await this.client.connect();
            this.isConnected = true;
            console.log('✅ Cache service connected');
        } catch (error) {
            console.error('❌ Cache service connection failed:', error);
            throw error;
        }
    }

    /**
     * Disconnect from Redis
     */
    async disconnect() {
        if (this.client && this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
            console.log('Cache service disconnected');
        }
    }

    /**
     * Set a value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache (will be JSON stringified)
     * @param {number} ttl - Time to live in seconds (default: 1 hour)
     */
    async set(key, value, ttl = 3600) {
        try {
            const serialized = JSON.stringify(value);
            await this.client.setEx(key, ttl, serialized);
        } catch (error) {
            console.error('❌ Cache set failed:', error);
            throw error;
        }
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {Promise<any|null>} - Cached value or null if not found
     */
    async get(key) {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('❌ Cache get failed:', error);
            return null;
        }
    }

    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     */
    async delete(key) {
        try {
            await this.client.del(key);
        } catch (error) {
            console.error('❌ Cache delete failed:', error);
        }
    }

    /**
     * Delete multiple keys matching a pattern
     * @param {string} pattern - Key pattern (e.g., "user:*")
     */
    async deletePattern(pattern) {
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        } catch (error) {
            console.error('❌ Cache delete pattern failed:', error);
        }
    }

    /**
     * Check if key exists
     * @param {string} key - Cache key
     * @returns {Promise<boolean>}
     */
    async exists(key) {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error('❌ Cache exists check failed:', error);
            return false;
        }
    }

    /**
     * Cache user session
     * @param {string} userId - User ID
     * @param {object} sessionData - Session data
     * @param {number} ttl - TTL in seconds (default: 24 hours)
     */
    async setUserSession(userId, sessionData, ttl = 86400) {
        const key = `session:${userId}`;
        await this.set(key, sessionData, ttl);
    }

    /**
     * Get user session
     * @param {string} userId - User ID
     * @returns {Promise<object|null>}
     */
    async getUserSession(userId) {
        const key = `session:${userId}`;
        return this.get(key);
    }

    /**
     * Cache user's last visited maps
     * @param {string} userId - User ID
     * @param {array} mapIds - Array of map IDs
     */
    async setLastMaps(userId, mapIds) {
        const key = `user:${userId}:lastMaps`;
        await this.set(key, mapIds, 604800); // 7 days
    }

    /**
     * Get user's last visited maps
     * @param {string} userId - User ID
     * @returns {Promise<array>}
     */
    async getLastMaps(userId) {
        const key = `user:${userId}:lastMaps`;
        return (await this.get(key)) || [];
    }

    /**
     * Cache a concept map
     * @param {string} mapId - Map ID
     * @param {object} mapData - Map data
     */
    async cacheMap(mapId, mapData) {
        const key = `map:${mapId}`;
        await this.set(key, mapData, 3600); // 1 hour
    }

    /**
     * Get cached map
     * @param {string} mapId - Map ID
     * @returns {Promise<object|null>}
     */
    async getCachedMap(mapId) {
        const key = `map:${mapId}`;
        return this.get(key);
    }

    /**
     * Invalidate map cache
     * @param {string} mapId - Map ID
     */
    async invalidateMap(mapId) {
        const key = `map:${mapId}`;
        await this.delete(key);
    }

    /**
     * Cache node data
     * @param {string} nodeId - Node ID
     * @param {object} nodeData - Node data
     */
    async cacheNode(nodeId, nodeData) {
        const key = `node:${nodeId}`;
        await this.set(key, nodeData, 3600); // 1 hour
    }

    /**
     * Get cached node
     * @param {string} nodeId - Node ID
     * @returns {Promise<object|null>}
     */
    async getCachedNode(nodeId) {
        const key = `node:${nodeId}`;
        return this.get(key);
    }

    /**
     * Publish real-time update (for collaborative features)
     * @param {string} channel - Channel name
     * @param {object} message - Message to publish
     */
    async publish(channel, message) {
        try {
            const serialized = JSON.stringify(message);
            await this.client.publish(channel, serialized);
        } catch (error) {
            console.error('❌ Publish failed:', error);
        }
    }

    /**
     * Subscribe to real-time updates
     * @param {string} channel - Channel name
     * @param {function} callback - Callback function for messages
     */
    async subscribe(channel, callback) {
        try {
            const subscriber = this.client.duplicate();
            await subscriber.connect();

            await subscriber.subscribe(channel, (message) => {
                try {
                    const parsed = JSON.parse(message);
                    callback(parsed);
                } catch (error) {
                    console.error('❌ Message parse failed:', error);
                }
            });

            return subscriber;
        } catch (error) {
            console.error('❌ Subscribe failed:', error);
            throw error;
        }
    }

    /**
     * Increment a counter
     * @param {string} key - Counter key
     * @returns {Promise<number>} - New value
     */
    async increment(key) {
        try {
            return await this.client.incr(key);
        } catch (error) {
            console.error('❌ Increment failed:', error);
            throw error;
        }
    }

    /**
     * Set expiration on existing key
     * @param {string} key - Cache key
     * @param {number} ttl - Time to live in seconds
     */
    async expire(key, ttl) {
        try {
            await this.client.expire(key, ttl);
        } catch (error) {
            console.error('❌ Expire failed:', error);
        }
    }
}

module.exports = new CacheService();