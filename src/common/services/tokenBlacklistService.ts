import { redisClient } from "../lib/redis";
import logger from "../utils/logger";

const TOKEN_PREFIX = 'revoked:access:'

export class TokenBlacklistService {

    private getKey(jti: string): string {
        return `${TOKEN_PREFIX}${jti}`;
    }

    async blacklistToken(jti: string, ttlMs: number): Promise<void> {
        if (ttlMs <= 0) {
            logger.warn(`Attempted to blacklist token JTI ${jti} with TTL ${ttlMs}ms. Skipping.`);
            return;
        }
        
        const key = this.getKey(jti);

        try {
            await redisClient.set(key, 'true', { PX: ttlMs, NX: true });
            logger.info(`Token JTI ${jti} blacklisted for ${ttlMs}ms.`);
        } catch (error) {
            logger.error(`Failed to blacklist token JTI ${jti}:`, error);
        }
    }

    async isTokenBlacklisted(jti: string): Promise<boolean> {
        const key = this.getKey(jti);
        try {
            const result = await redisClient.get(key);
            return !!result;
        } catch (error) {
            logger.error(`Failed to check if token JTI ${jti} is blacklisted:`, error);
            return false;
        }
    }
}

export const tokenBlacklistService = new TokenBlacklistService();