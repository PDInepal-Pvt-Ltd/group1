import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateTableSchema,TableResponseSchema,tableSchema, AssignWaiterSchema, UpdateTableSchema } from "./tableModel";
import { tableController } from "./tableController";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";

export const tableRegistry = new OpenAPIRegistry();
export const tableRouter: Router = Router();

tableRegistry.register("Table", tableSchema);

tableRegistry.registerComponent("securitySchemes","bearerAuth", {
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