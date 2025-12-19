import { handleServiceResponse } from "@/common/utils/serviceResponse";
import type { Request, RequestHandler, Response } from "express";
import { healthCheckService } from "./healthCheckService";

class HealthCheckController {
  public healthCheck: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await healthCheckService.healthCheck();
    return handleServiceResponse(serviceResponse, res);
  };
}

export const healthCheckController = new HealthCheckController();