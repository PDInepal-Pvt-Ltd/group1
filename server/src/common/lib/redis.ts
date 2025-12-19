import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

export const redisClient: RedisClientType = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
    }
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
