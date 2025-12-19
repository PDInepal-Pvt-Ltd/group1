import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateTableSchema, TableResponseSchema, tableSchema, AssignWaiterSchema, UpdateTableSchema } from "./tableModel";
import { tableController } from "./tableController";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";
import { TableStatus } from "@/generated/prisma/enums";

export const tableRegistry = new OpenAPIRegistry();
export const tableRouter: Router = Router();

tableRegistry.register("Table", tableSchema);

tableRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

tableRegistry.registerPath({
    method: "post",
    path: "/api/table",
    summary: "Create a new table",
    tags: ["Table"],
    request: {
        body: {
            description: "Table object that needs to be created",
            required: true,
            content: {
                "application/json": {
                    schema: CreateTableSchema,
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(TableResponseSchema, "Table created successfully", StatusCodes.CREATED),
});

tableRouter.post("/table", verifyJWT, checkRole(["ADMIN"]), tableController.createTable);

tableRegistry.registerPath({
    method: "get",
    path: "/api/table",
    summary: "Find all tables",
    tags: ["Table"],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(TableResponseSchema.array(), "Tables retrieved successfully", StatusCodes.OK),
});

tableRouter.get("/table", verifyJWT, tableController.getAllTables);

tableRegistry.registerPath({
    method: "get",
    path: "/api/table/{id}",
    summary: "Find table by ID",
    tags: ["Table"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the table to be retrieved",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(TableResponseSchema, "Table retrieved successfully", StatusCodes.OK),
});

tableRouter.get("/table/:id", verifyJWT, tableController.getTableById);

tableRegistry.registerPath({
    method: "get",
    path: "/api/table/available",
    summary: "Find available tables by number of seats",
    tags: ["Table"],
    parameters: [
        {
            name: "seats",
            in: "query",
            required: true,
            schema: {
                type: "integer",
            },
            description: "Number of seats required",
            example: 4,
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(TableResponseSchema.array(), "Available tables retrieved successfully", StatusCodes.OK),
});

tableRouter.get("/table/available", verifyJWT, tableController.findAvailableTablesBySeats);

tableRegistry.registerPath({
    method: "patch",
    path: "/api/table/assign/{id}",
    summary: "Assign a table to a waiter",
    tags: ["Table"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the table to be assigned",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    request: {
        body: {
            description: "Waiter assignment details",
            required: true,
            content: {
                "application/json": {
                    schema: AssignWaiterSchema,
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(TableResponseSchema, "Table assigned successfully", StatusCodes.OK),
});

tableRouter.patch("/table/assign/:id", verifyJWT, checkRole(["ADMIN"]), tableController.assignTableToWaiter);

tableRegistry.registerPath({
    method: "patch",
    path: "/api/table/unassign/{id}",
    summary: "Unassign a table from a waiter",
    tags: ["Table"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the table to be unassigned",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(TableResponseSchema, "Table unassigned successfully", StatusCodes.OK),
});

tableRouter.patch("/table/unassign/:id", verifyJWT, checkRole(["ADMIN"]), tableController.unassignTableFromWaiter);

tableRegistry.registerPath({
    method: "patch",
    path: "/api/table/status/{id}",
    summary: "Update a table's status",
    tags: ["Table"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the table to be updated",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    request: {
        body: {
            description: "Table status update details",
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            status: {
                                type: "string",
                                enum: Object.keys(TableStatus),
                            },
                        },
                    },
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(TableResponseSchema, "Table status updated successfully", StatusCodes.OK),
});

tableRouter.patch("/table/status/:id", verifyJWT, checkRole(["ADMIN"]), tableController.updateTableStatus);

tableRegistry.registerPath({
    method: "put",
    path: "/api/table/{id}",
    summary: "Update a table",
    tags: ["Table"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the table to be updated",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    request: {
        body: {
            description: "Table object that needs to be updated",
            required: true,
            content: {
                "application/json": {
                    schema: UpdateTableSchema,
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(TableResponseSchema, "Table updated successfully", StatusCodes.OK),
});

tableRouter.put("/table/:id", verifyJWT, checkRole(["ADMIN"]), tableController.updateTable);

tableRegistry.registerPath({
    method: "delete",
    path: "/api/table/{id}",
    summary: "Delete a table",
    tags: ["Table"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the table to be deleted",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(TableResponseSchema, "Table deleted successfully", StatusCodes.OK),
});

tableRouter.delete("/table/:id", verifyJWT, checkRole(["ADMIN"]), tableController.deleteTable);