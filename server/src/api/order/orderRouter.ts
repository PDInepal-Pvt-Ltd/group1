import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateOrderSchema, orderSchema, OrderResponseSchema, UpdateOrderSchema } from "./orderModel";
import { StatusCodes } from "http-status-codes";
import { orderController } from "./orderController";
import { optionalJwt } from "@/common/middleware/optionalJwt";
import { verifyJWT } from "@/common/middleware/verifyJWT";

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

orderRegistry.registerPath({
    method: "get",
    path: "/api/order/{id}",
    summary: "Get order by ID",
    tags: ["Order"],
    parameters: [
        {
            name: "id",
            in: "path",
            description: "ID of the order to get",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    responses: createApiResponse(OrderResponseSchema, "Order found successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

orderRouter.get("/order/:id", verifyJWT, orderController.getOrderById);

orderRegistry.registerPath({
    method: "get",
    path: "/api/order",
    summary: "Get all orders",
    tags: ["Order"],
    responses: createApiResponse(OrderResponseSchema.array(), "Orders found successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

orderRouter.get("/order", verifyJWT, orderController.getAllOrders);

orderRegistry.registerPath({
    method: "put",
    path: "/api/order/{id}",
    summary: "Update order by ID",
    tags: ["Order"],
    parameters: [
        {
            name: "id",
            in: "path",
            description: "ID of the order to update",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    request: {
        body: {
            description: "Order object that needs to be updated",
            required: true,
            content: {
                "application/json": {
                    schema: UpdateOrderSchema,
                },
            },
        },
    },
    responses: createApiResponse(OrderResponseSchema, "Order updated successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

orderRouter.put("/order/:id", verifyJWT, orderController.updateOrder);

orderRegistry.registerPath({
    method: "delete",
    path: "/api/order/{id}",
    summary: "Delete order by ID",
    tags: ["Order"],
    parameters: [
        {
            name: "id",
            in: "path",
            description: "ID of the order to delete",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    responses: createApiResponse(OrderResponseSchema, "Order deleted successfully", StatusCodes.OK),
    security: [{ bearerAuth: [] }],
});

orderRouter.delete("/order/:id", verifyJWT, orderController.deleteOrder);