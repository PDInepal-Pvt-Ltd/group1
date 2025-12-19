import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const auditlogSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the audit log entry", example: "123e4567-e89b-12d3-a456-426655440000"}),
    createdAt: z.date().openapi({ description: "Date and time when the audit log entry was created", example: "2022-01-01T00:00:00.000Z"}),
    userId: z.string().nullable().openapi({ description: "Identifier of the user associated with the action", example: "123e4567-e89b-12d3-a456-426655440000"}),
    action: z.string().openapi({ description: "Action performed", example: "ORDER_CREATE"}),
    resourceType: z.string().nullable().openapi({ description: "Type of resource involved in the action", example: "ORDER"}),
    resourceId: z.string().nullable().openapi({ description: "Identifier of the resource involved in the action", example: "ord_123e4567-e89b-12d3-a456-426655440000"}),
    payload: z.any().nullable().openapi({ description: "Additional details about the action", example: { itemCount: 3, totalPrice: 29.99 }}),
    ip: z.string().nullable().openapi({ description: "IP address from which the action was performed", example: "237.84.2.178"}),
    userAgent: z.string().nullable().openapi({ description: "User agent string of the client used to perform the action", example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}),
});

export const CreateAuditLogSchema = auditlogSchema.pick({
    userId: true,
    action: true,
    resourceType: true,
    resourceId: true,
    payload: true,
    ip: true,
    userAgent: true,
});

export const AuditLogResponseSchema = auditlogSchema;

export type AuditLog = z.infer<typeof auditlogSchema>;
export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;
export type AuditLogResponse = z.infer<typeof AuditLogResponseSchema>;