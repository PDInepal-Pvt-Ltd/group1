import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { healthCheckController } from "./healthCheckController";
import { HealthCheckResponseSchema } from "./healthCheckModel";

export const healthCheckRegistry = new OpenAPIRegistry();
export const healthCheckRouter: Router = express.Router();

healthCheckRegistry.registerPath({
  method: "get",
  path: "/api/health-check",
  tags: ["Health Check"],
  responses: createApiResponse(HealthCheckResponseSchema, "Success"),
});

healthCheckRouter.get("/health-check", healthCheckController.healthCheck);