import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL
});

export const connectRedis = async () => {
    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    redisClient.on('connect', () => logger.info('Redis Client Connected'));

    try {
        await redisClient.connect();
        logger.info('Connected to Redis successfully');
    } catch (error) {
        logger.error('Failed to connect to Redis during startup:', error);
        throw error;
    }
};
