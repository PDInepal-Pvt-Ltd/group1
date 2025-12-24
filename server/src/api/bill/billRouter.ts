import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";
import { billController } from "./billController";
import { BillResponseSchema, billSchema, CreateBillSchema } from "./billModel";
import { Role } from "@/generated/prisma/enums";
import { PaymentMode } from "@/generated/prisma/enums";
export const billRegistry = new OpenAPIRegistry();
export const billRouter: Router = Router();

billRegistry.register("Bill", billSchema);

billRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

billRegistry.registerPath({
    method: "post",
    path: "/api/bill",
    summary: "Create a new bill",
    tags: ["Bill"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json":
                {
                    schema: CreateBillSchema
                }
            }
        }
    },
    responses: createApiResponse(BillResponseSchema, "Bill created successfully", StatusCodes.CREATED),
});

billRouter.post("/bill", verifyJWT, checkRole([Role.ADMIN, Role.CASHIER]), billController.createBill);

billRegistry.registerPath({
    method: "get",
    path: "/api/bill/{id}",
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the bill to be retrieved",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    summary: "Get a bill by id",
    tags: ["Bill"],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(BillResponseSchema, "Bill retrieved successfully", StatusCodes.OK),
});

billRouter.get("/bill/:id", verifyJWT, checkRole([Role.ADMIN, Role.CASHIER]), billController.getBillById);

billRegistry.registerPath({
    method: "get",
    path: "/api/bill",
    summary: "Get all bills",
    tags: ["Bill"],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(BillResponseSchema, "Bills retrieved successfully", StatusCodes.OK),
});

billRouter.get("/bill", verifyJWT, checkRole([Role.ADMIN, Role.CASHIER]), billController.getAllBills);

billRegistry.registerPath({
    method: "post",
    path: "/api/bill/{id}/pay",
    request: {
        body: {
            content: {
                "application/json":
                {
                    schema: {
                        type: "object",
                        properties: {
                            paymentMode: {
                                type: "string",
                                enum: Object.values(PaymentMode),
                            },
                        },
                    }
                }
            }
        }
    },
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the bill to be paid",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    summary: "Pay a bill",
    tags: ["Bill"],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(BillResponseSchema, "Bill paid successfully", StatusCodes.OK),
});

billRouter.post("/bill/:id/pay", verifyJWT, checkRole([Role.ADMIN, Role.CASHIER]), billController.payBill);

billRegistry.registerPath({
    method: "get",
    path: "/api/bill/daily-report",
    parameters: [
        {
            name: "date",
            in: "query",
            required: false,
            schema: {
                type: "string",
            },
            description: "Date in YYYY-MM-DD format",
            example: "2023-08-15",
        },
    ],
    summary: "Get daily report for a specific date",
    tags: ["Bill"],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(BillResponseSchema, "Daily report retrieved successfully", StatusCodes.OK),
});

billRouter.get("/bill/daily-report", verifyJWT, checkRole([Role.ADMIN, Role.CASHIER]), billController.getDailyReport);