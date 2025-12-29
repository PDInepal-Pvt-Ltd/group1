import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { tokenBlacklistService } from "../services/tokenBlacklistService";
import logger from "../utils/logger";

interface JWTPayload {
  userId: string;
  role: string;
  jti: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const optionalJwt = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    req.user = undefined;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JWTPayload;
    const tokenId = decoded.jti;

    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(tokenId);
    if (isBlacklisted) {
      req.user = undefined;
      return next();
    }

    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    return next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      logger.warn("Optional JWT invalid or expired:", error.message);
    } else {
      logger.error("Unexpected error in optionalJwt:", error);
    }

    req.user = undefined;
    return next();
  }
};   