import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuditLogResponseSchema, auditlogSchema } from "./auditlogModel";
import { StatusCodes } from "http-status-codes";
import { auditLogController } from "./auditlogController";
import { verifyJWT } from "@/common/middleware/verifyJWT";

export const auditLogRegistry = new OpenAPIRegistry();
export const auditLogRouter: Router = Router();

auditLogRegistry.register("AuditLog", auditlogSchema);

auditLogRegistry.registerComponent("securitySchemes","bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

auditLogRegistry.registerPath({
    method: "get",
    path: "/api/auditlog",
    summary: "Get all audit logs",
    tags: ["AuditLog"],
    responses: createApiResponse(AuditLogResponseSchema, "Audit logs found successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

auditLogRouter.get("/auditlog", verifyJWT, auditLogController.getAllAuditLogs);

auditLogRegistry.registerPath({
    method: "get",
    path: "/api/auditlog/{id}",
    summary: "Get audit log by ID",
    tags: ["AuditLog"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    responses: createApiResponse(AuditLogResponseSchema, "Audit log found successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

auditLogRouter.get("/auditlog/:id", verifyJWT, auditLogController.getAuditLogById);

auditLogRegistry.registerPath({
    method: "get",
    path: "/api/auditlog/user/{id}",
    summary: "Get audit logs by user ID",
    tags: ["AuditLog"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    responses: createApiResponse(AuditLogResponseSchema.array(), "Audit logs found successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

auditLogRouter.get("/auditlog/user/:id", verifyJWT, auditLogController.getAuditLogsByUserId);