import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

export const authRateLimiter = rateLimit({
    legacyHeaders: true,
    standardHeaders: true,

    limit: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5'),

    windowMs: 60 * 1000 * parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '5'),

    message: {
        success: false,
        message: `Too many authentication attempts from this IP, please try again in ${process.env.AUTH_RATE_LIMIT_WINDOW_MS} minutes.`,
        data: null,
    },

    keyGenerator:(req: Request) => ipKeyGenerator(req.ip as string),
    
});
