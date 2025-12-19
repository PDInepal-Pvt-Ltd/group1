import { prisma } from "@/common/lib/prisma";
import { CreateAuditLog, AuditLogResponse } from "./auditlogModel";

export class AuditLogRepository {
    async createAuditLog(data: CreateAuditLog): Promise<AuditLogResponse> {
        return prisma.auditLog.create({ data });
    }
}