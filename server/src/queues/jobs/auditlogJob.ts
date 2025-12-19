import { Job } from "bullmq";
import { AuditLogRepository } from "@/api/auditlog/auditlogRepository";
import { CreateAuditLog } from "@/api/auditlog/auditlogModel";

export const createAuditLog = async (job: Job<CreateAuditLog>) => {
  const auditLogRepository = new AuditLogRepository();
  await auditLogRepository.createAuditLog(job.data);
};   