import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateTableSchema,TableResponseSchema,tableSchema } from "./tableModel";
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
    responses: createApiResponse(TableResponseSchema, "User created successfully", StatusCodes.CREATED),
});

tableRouter.post("/table", verifyJWT, checkRole(["ADMIN"]), tableController.createTable);