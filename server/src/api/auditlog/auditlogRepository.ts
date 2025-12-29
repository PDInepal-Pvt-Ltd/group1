import { prisma } from "@/common/lib/prisma";
import { CreateAuditLog, AuditLogResponse } from "./auditlogModel";

export class AuditLogRepository {
    async createAuditLog(data: CreateAuditLog): Promise<AuditLogResponse> {
        return prisma.auditLog.create({ data });
    }

    async getAllAuditLogs(): Promise<AuditLogResponse[] | null> {
        return prisma.auditLog.findMany();
    }

    async getAuditLogById(id: string): Promise<AuditLogResponse | null> {
        return prisma.auditLog.findUnique({ where: { id } });    
    }

    async getAuditLogsByUserId(userId: string): Promise<AuditLogResponse[] | null> {
        return prisma.auditLog.findMany({ where: { userId } });    
    }
}