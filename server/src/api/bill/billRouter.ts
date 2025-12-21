import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";
import { billController } from "./billController";
import { BillResponseSchema, billSchema, CreateBillSchema } from "./billModel";
import { Role } from "@/generated/prisma/enums";

export const billRegistry = new OpenAPIRegistry();
export const billRouter: Router = Router();

billRegistry.register("Bill", billSchema);

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
