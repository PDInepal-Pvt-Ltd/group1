import { StatusCodes } from "http-status-codes";
import { AuditLogRepository } from "./auditlogRepository";
import type { AuditLogResponse } from "./auditlogModel";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import logger from "@/common/utils/logger";

export class AuditLogService {
    private auditLogRepository: AuditLogRepository;

    constructor(auditLogRepository: AuditLogRepository = new AuditLogRepository()) {
        this.auditLogRepository = auditLogRepository;
    }

    async getAllAuditLogs(): Promise<ServiceResponse<AuditLogResponse[] | null>> {
        try {
            const auditLogs = await this.auditLogRepository.getAllAuditLogs();

            if (!auditLogs) {
                return ServiceResponse.failure("Audit logs not found", null, StatusCodes.NOT_FOUND);
            }

            return ServiceResponse.success("Audit logs fetched successfully", auditLogs, StatusCodes.OK);
        } catch (error) {
            logger.error(error);
            return ServiceResponse.failure("Failed to fetch audit logs", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAuditLogById(id: string): Promise<ServiceResponse<AuditLogResponse | null>> {
        try {
            const auditLog = await this.auditLogRepository.getAuditLogById(id);

            if (!auditLog) {
                return ServiceResponse.failure("Audit log not found", null, StatusCodes.NOT_FOUND);
            }

            return ServiceResponse.success("Audit log fetched successfully", auditLog, StatusCodes.OK);
        } catch (error) {
            logger.error(error);
            return ServiceResponse.failure("Failed to fetch audit log", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAuditLogsByUserId(userId: string): Promise<ServiceResponse<AuditLogResponse[] | null>> {
        try {
            const auditLogs = await this.auditLogRepository.getAuditLogsByUserId(userId);

            if (!auditLogs) {
                return ServiceResponse.failure("Audit logs not found", null, StatusCodes.NOT_FOUND);
            }

            return ServiceResponse.success("Audit logs fetched successfully", auditLogs, StatusCodes.OK);
        } catch (error) {
            logger.error(error);
            return ServiceResponse.failure("Failed to fetch audit logs", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const auditLogService = new AuditLogService();