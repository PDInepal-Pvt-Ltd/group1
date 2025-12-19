import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { Role } from "@/generated/prisma/enums";

export const checkRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return handleServiceResponse(
        ServiceResponse.failure("Authentication required", null, StatusCodes.UNAUTHORIZED),
        res
      );
    }
    const userRole = req.user.role as Role;

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      const errorMessage = `Access denied. Role '${userRole}' is not permitted.`;
      return handleServiceResponse(
        ServiceResponse.failure(errorMessage, null, StatusCodes.FORBIDDEN),
        res
      );
    }
  };
};