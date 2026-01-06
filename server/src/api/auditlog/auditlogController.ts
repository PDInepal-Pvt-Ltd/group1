import { RequestHandler } from "express";
import { handleServiceResponse, ServiceResponse } from "@/common/utils/serviceResponse";
import { AuditLogResponse } from "./auditlogModel";
import { auditLogService } from "./auditlogService";

class AuditLogController {
  public getAllAuditLogs: RequestHandler = async (_req, res) => {
    const serviceResponse: ServiceResponse<AuditLogResponse[] | null> = await auditLogService.getAllAuditLogs();
    return handleServiceResponse(serviceResponse, res);  
  };

  public getAuditLogById: RequestHandler = async (req, res) => {
    const serviceResponse: ServiceResponse<AuditLogResponse | null> = await auditLogService.getAuditLogById(req.params.id);
    return handleServiceResponse(serviceResponse, res);  
  };

  public getAuditLogsByUserId: RequestHandler = async (req, res) => {
    const serviceResponse: ServiceResponse<AuditLogResponse[] | null> = await auditLogService.getAuditLogsByUserId(req.params.id);
    return handleServiceResponse(serviceResponse, res);  
  };
}

export const auditLogController = new AuditLogController();