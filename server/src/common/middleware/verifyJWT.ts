import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
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

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return handleServiceResponse(
        ServiceResponse.failure("Access token is missing or invalid", null, StatusCodes.UNAUTHORIZED),
        res
      );
    }

    const accessToken = authHeader.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as JWTPayload;
    const TOKEN_ID = decoded.jti;

    const isBlacklistedToken = await tokenBlacklistService.isTokenBlacklisted(TOKEN_ID);

    if (isBlacklistedToken) {
      return handleServiceResponse(
        ServiceResponse.failure("Token is blacklisted", null, StatusCodes.UNAUTHORIZED),
        res
      );
    }

    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return handleServiceResponse(
        ServiceResponse.failure("Invalid token format", null, StatusCodes.UNAUTHORIZED),
        res
      );
    }

    if (error.name === "TokenExpiredError") {
      return handleServiceResponse(
        ServiceResponse.failure("Token has expired", null, StatusCodes.UNAUTHORIZED),
        res
      );
    }
    logger.error("JWT Verification Error:", error);
    return handleServiceResponse(
      ServiceResponse.failure("Authentication failed", null, StatusCodes.UNAUTHORIZED),
      res
    );
  }
};