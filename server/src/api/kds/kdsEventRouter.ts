import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateKdsEventSchema, KdsEventResponseSchema, KdsPerformanceSchema } from "./kdsEventModel";
import { kdsEventController } from "./kdsEventController";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";

export const kdsEventRegistry = new OpenAPIRegistry();
export const kdsEventRouter: Router = Router();

kdsEventRegistry.registerPath({
    method: "post",
    path: "/api/kds-event",
    summary: "Log a KDS status change",
    tags: ["KDS"],
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: CreateKdsEventSchema } },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(KdsEventResponseSchema, "Event logged", StatusCodes.CREATED),
});

kdsEventRouter.post("/kds-event", verifyJWT, kdsEventController.createEvent);

kdsEventRegistry.registerPath({
    method: "get",
    path: "/api/kds-event/order/{orderId}",
    summary: "Get timeline for an order",
    tags: ["KDS"],
    parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(KdsEventResponseSchema.array(), "Timeline retrieved", StatusCodes.OK),
});

kdsEventRouter.get("/kds-event/order/:orderId", verifyJWT, kdsEventController.getEventsByOrder);

kdsEventRegistry.registerPath({
    method: "get",
    path: "/api/kds/queue",
    summary: "Get active kitchen orders",
    tags: ["KDS"],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(KdsEventResponseSchema.array(), "Success", StatusCodes.OK),
});
kdsEventRouter.get("/kds/queue", verifyJWT, kdsEventController.getQueue);

kdsEventRegistry.registerPath({
    method: "post",
    path: "/api/kds/status",
    summary: "Transition order status (e.g. Start Cooking, Mark Ready)",
    tags: ["KDS"],
    request: { body: { content: { "application/json": { schema: CreateKdsEventSchema } } } },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(KdsEventResponseSchema, "Status updated", StatusCodes.CREATED),
});
kdsEventRouter.post("/kds/status", verifyJWT, kdsEventController.updateStatus);

kdsEventRegistry.registerPath({
    method: "get",
    path: "/api/kds/performance",
    summary: "Get kitchen efficiency report",
    tags: ["KDS"],
    parameters: [{ name: "days", in: "query", schema: { type: "integer", default: 7 } }],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(KdsPerformanceSchema, "Report generated", StatusCodes.OK),
});
kdsEventRouter.get("/kds/performance", verifyJWT, checkRole(["ADMIN"]), kdsEventController.getPerformance);

kdsEventRegistry.registerPath({
    method: "get",
    path: "/api/kds/order/{orderId}",
    summary: "Get status history for a specific order",
    tags: ["KDS"],
    parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(KdsEventResponseSchema.array(), "Timeline found", StatusCodes.OK),
});
kdsEventRouter.get("kds/order/:orderId", verifyJWT, kdsEventController.getTimeline);