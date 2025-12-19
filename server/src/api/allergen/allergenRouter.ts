import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateAllergenSchema, UpdateAllergenSchema, AllergenResponseSchema, allergenSchema } from "./allergenModel";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";
import { allergenController } from "./allergenController";

export const allergenRegistry = new OpenAPIRegistry();
export const allergenRouter: Router = Router();

allergenRegistry.register("Allergen", allergenSchema);

allergenRegistry.registerPath({
    method: "post",
    path: "/api/allergen",
    summary: "Create a new allergen",
    tags: ["Allergen"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: CreateAllergenSchema } }
        }
    },
    responses: createApiResponse(AllergenResponseSchema, "Allergen created successfully", StatusCodes.CREATED),
});

allergenRouter.post("/allergen", verifyJWT, checkRole(["ADMIN"]), allergenController.createAllergen);

allergenRegistry.registerPath({
    method: "get",
    path: "/api/allergen",
    summary: "Find all allergens",
    tags: ["Allergen"],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(AllergenResponseSchema.array(), "Allergens retrieved successfully", StatusCodes.OK),
});

allergenRouter.get("/allergen", allergenController.getAllAllergens);

allergenRegistry.registerPath({
    method: "get",
    path: "/api/allergen/{id}",
    summary: "Find allergen by ID",
    tags: ["Allergen"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(AllergenResponseSchema, "Allergen retrieved successfully", StatusCodes.OK),
});

allergenRouter.get("/allergen/:id", allergenController.getAllergenById);

allergenRegistry.registerPath({
    method: "put",
    path: "/api/allergen/{id}",
    summary: "Update allergen by ID",
    tags: ["Allergen"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: UpdateAllergenSchema } }
        }
    },
    responses: createApiResponse(AllergenResponseSchema, "Allergen updated successfully", StatusCodes.OK),
});

allergenRouter.put("/allergen/:id", verifyJWT, checkRole(["ADMIN"]), allergenController.updateAllergen);

allergenRegistry.registerPath({
    method: "delete",
    path: "/api/allergen/{id}",
    summary: "Delete allergen by ID",
    tags: ["Allergen"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(AllergenResponseSchema, "Allergen deleted successfully", StatusCodes.OK),
});

allergenRouter.delete("/allergen/:id", verifyJWT, checkRole(["ADMIN"]), allergenController.deleteAllergen);