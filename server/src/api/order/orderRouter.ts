import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateOrderSchema, orderSchema, OrderResponseSchema } from "./orderModel";
import { StatusCodes } from "http-status-codes";
import { orderController } from "./orderController";
import { optionalJwt } from "@/common/middleware/optionalJwt";

export const orderRegistry = new OpenAPIRegistry();
export const orderRouter: Router = Router();

orderRegistry.registerComponent("securitySchemes","bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

orderRegistry.register("Order",orderSchema);

orderRegistry.registerPath({
    method: "post",
    path: "/api/order",
    summary: "Create a new order",
    tags: ["Order"],
    request: {
        body: {
            description: "Order object that needs to be created",
            required: true,
            content: {
                "application/json": {
                    schema: CreateOrderSchema,
                },
            },
        },
    },
    responses: createApiResponse(OrderResponseSchema, "Order created successfully", StatusCodes.CREATED),
    security: [{ bearerAuth: [] }],
});

orderRouter.post("/order",optionalJwt, orderController.createOrder);
