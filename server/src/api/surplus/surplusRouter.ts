import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateSurplusMarkSchema, SurplusMarkResponseSchema, DailySpecialResponseSchema } from "./surplusModel";
import { StatusCodes } from "http-status-codes";
import { surplusController } from "./surplusController";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";
import { Role } from "@/generated/prisma/enums";

export const surplusRegistry = new OpenAPIRegistry();
export const surplusRouter: Router = Router();

surplusRegistry.register("SurplusMark", SurplusMarkResponseSchema);

surplusRegistry.registerComponent("securitySchemes","bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

surplusRegistry.registerPath({
    method: "post",
    path: "/api/surplus",
    summary: "Create a new surplus mark",
    tags: ["Surplus"],
    request: {
        body: {
            description: "Surplus mark object that needs to be created",
            required: true,
            content: {
                "application/json": {
                    schema: CreateSurplusMarkSchema,
                },
            },
        },
    },
    responses: createApiResponse(SurplusMarkResponseSchema, "Surplus mark created successfully", StatusCodes.CREATED),
    security: [{ bearerAuth: [] }],
});

surplusRouter.post("/surplus", verifyJWT, checkRole([Role.ADMIN, Role.KITCHEN]), surplusController.createSurplusMark);

surplusRegistry.registerPath({
    method: "get",
    path: "/api/surplus",
    summary: "Get all active daily specials",
    tags: ["Surplus"],
    responses: createApiResponse(DailySpecialResponseSchema, "Daily specials retrieved successfully", StatusCodes.OK),
});

surplusRouter.get("/surplus", surplusController.getActiveSpecials);

surplusRegistry.registerPath({
    method: "get",
    path: "/api/surplus/{id}",
    summary: "Get a specific surplus mark",
    tags: ["Surplus"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the surplus mark to be retrieved",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    responses: createApiResponse(SurplusMarkResponseSchema, "Surplus mark retrieved successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

surplusRouter.get("/surplus/:id", verifyJWT, checkRole([Role.ADMIN, Role.KITCHEN]), surplusController.getSurplusMarkById);

surplusRegistry.registerPath({
    method: "delete",
    path: "/api/surplus/{id}",
    summary: "Delete a surplus mark",
    tags: ["Surplus"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the surplus mark to be deleted",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    responses: createApiResponse(SurplusMarkResponseSchema, "Surplus mark deleted successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

surplusRouter.delete("/surplus/:id", verifyJWT, checkRole([Role.ADMIN, Role.KITCHEN]), surplusController.deleteSurplusMark);

surplusRegistry.registerPath({
    method: "put",
    path: "/api/surplus/{id}",
    summary: "Update a surplus mark",
    tags: ["Surplus"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the surplus mark to be updated",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    request: {
        body: {
            description: "Surplus mark object that needs to be updated",
            required: true,
            content: {
                "application/json": {
                    schema: CreateSurplusMarkSchema,
                },
            },
        },
    },
    responses: createApiResponse(SurplusMarkResponseSchema, "Surplus mark updated successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

surplusRouter.put("/surplus/:id", verifyJWT, checkRole([Role.ADMIN, Role.KITCHEN]), surplusController.updateSurplusMark);

