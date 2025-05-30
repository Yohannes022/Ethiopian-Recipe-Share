import { createClient, RedisClientType } from 'redis';
import { ApiError } from '../utils/api-error';

class CacheService {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL is not defined in environment variables');
    }

    this.client = createClient({
      url: process.env.REDIS_URL,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
      this.isConnected = true;
    });

    // Connect to Redis
    this.connect().catch(console.error);
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        this.isConnected = false;
      }
    }
  }

  /**
   * Set a value in cache
   */
  async set(
    key: string,
    value: any,
    ttlInSeconds?: number
  ): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttlInSeconds) {
        await this.client.setEx(key, ttlInSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async delByPattern(pattern: string): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      const result = await this.client.del(keys);
      return result;
    } catch (error) {
      console.error('Cache delete by pattern error:', error);
      return 0;
    }
  }

  /**
   * Clear the entire cache (use with caution)
   */
  async flushAll(): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Cache flush all error:', error);
      return false;
    }
  }

  /**
   * Get cache keys by pattern
   */
  async getKeys(pattern: string): Promise<string[]> {
    if (!this.isConnected) return [];

    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Cache get keys error:', error);
      return [];
    }
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.isConnected) return -2; // -2 means key doesn't exist in Redis

    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Cache TTL error:', error);
      return -2;
    }
  }

  /**
   * Close the Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
      } catch (error) {
        console.error('Error disconnecting from Redis:', error);
      }
    }
  }
}

// Create a singleton instance
export const cacheService = new CacheService();

// Handle application shutdown
process.on('SIGINT', async () => {
  await cacheService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cacheService.disconnect();
  process.exit(0);
});
