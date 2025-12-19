import { Router } from "express";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";
import { categoryController } from "./categoryController";
import {
  CategoryResponseSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  categorySchema,
} from "./categoryModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { StatusCodes } from "http-status-codes";

export const categoryRouter = Router();
export const categoryRegistry = new OpenAPIRegistry();

categoryRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

categoryRegistry.register("Category", categorySchema);

categoryRegistry.registerPath({
  method: "post",
  path: "/api/category",
  tags: ["Category"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: CreateCategorySchema },
      },
    },
  },
  responses: createApiResponse(
    CategoryResponseSchema,
    "Category created successfully",
    StatusCodes.CREATED
  ),
});

categoryRouter.post(
  "/category",
  verifyJWT,
  checkRole(["ADMIN"]),
  categoryController.createCategory
);

categoryRegistry.registerPath({
  method: "get",
  path: "/api/category",
  tags: ["Category"],
  security: [{ bearerAuth: [] }],
  responses: createApiResponse(
    CategoryResponseSchema.array(),
    "Categories fetched",
    StatusCodes.OK
  ),
});

categoryRouter.get("/category", categoryController.getAllCategories);

categoryRegistry.registerPath({
  method: "get",
  path: "/api/category/{id}",
  tags: ["Category"],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
  responses: createApiResponse(
    CategoryResponseSchema,
    "Category found",
    StatusCodes.OK
  ),
});

categoryRouter.get("/category/:id", categoryController.getCategoryById);

categoryRegistry.registerPath({
  method: "put",
  path: "/api/category/{id}",
  tags: ["Category"],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
  request: {
    body: {
      content: {
        "application/json": { schema: UpdateCategorySchema },
      },
    },
  },
  responses: createApiResponse(
    CategoryResponseSchema,
    "Category updated",
    StatusCodes.OK
  ),
});

categoryRouter.put(
  "/category/:id",
  verifyJWT,
  checkRole(["ADMIN"]),
  categoryController.updateCategory
);

categoryRegistry.registerPath({
  method: "delete",
  path: "/api/category/{id}",
  tags: ["Category"],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
  responses: createApiResponse(
    CategoryResponseSchema,
    "Category deleted",
    StatusCodes.OK
  ),
});

categoryRouter.delete(
  "/category/:id",
  verifyJWT,
  checkRole(["ADMIN"]),
  categoryController.deleteCategory
);
