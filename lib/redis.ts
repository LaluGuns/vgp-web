import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis | undefined };

const redisUrl = process.env.REDIS_URL;

export const redis = globalForRedis.redis || (redisUrl ? new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
}) : undefined);

if (process.env.NODE_ENV !== 'production' && redis) {
    globalForRedis.redis = redis;
}

if (!redisUrl) {
    console.warn('WARNING: REDIS_URL is not set. Token blacklisting is bypassed.');
}

export default redis;
