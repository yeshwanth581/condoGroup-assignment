import { createClient } from 'redis';
import logger from '../utils/logger';

const host = process.env.REDIS_HOST
const port = process.env.REDIS_PORT
const username = process.env.REDIS_USERNAME
const pwd = process.env.REDIS_PASSWORD

const redisClient = createClient({
    url: `redis://${username}:${pwd}@${host}:${port}`,
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        logger.info('Connected to Redis successfully.');
    } catch (error) {
        logger.error('Error connecting to Redis:', error);
        process.exit(1);
    }
};

const closeRedisConnection = async () => {
    try {
        await redisClient.disconnect();
        logger.info('Redis connection closed successfully.');
    } catch (error) {
        logger.error('Error closing Redis connection:', error);
    }
};

export { redisClient, connectRedis, closeRedisConnection };
