import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { LinkAllergenSchema, menuItemAllergenSchema, MenuItemAllergenResponseSchema } from "./menuItemAllergenModel";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";
import { menuItemAllergenController } from "./menuItemAllergenController";

export const menuItemAllergenRegistry = new OpenAPIRegistry();
export const menuItemAllergenRouter: Router = Router();

menuItemAllergenRegistry.register("MenuItemAllergen", menuItemAllergenSchema);

menuItemAllergenRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

menuItemAllergenRegistry.registerPath({
    method: "post",
    path: "/api/menu-item-allergen/link",
    summary: "Link allergens to a menu item",
    tags: ["MenuItemAllergen"],
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: LinkAllergenSchema } } }
    },
    responses: createApiResponse(MenuItemAllergenResponseSchema, "Linked successfully", StatusCodes.OK),
});

menuItemAllergenRouter.post("/menu-item-allergen/link", verifyJWT, checkRole(["ADMIN"]), menuItemAllergenController.linkAllergens);

menuItemAllergenRegistry.registerPath({
    method: "delete",
    path: "/api/menu-item-allergen/item/{menuItemId}/allergen/{allergenId}",
    parameters: [
        {
            name: "menuItemId",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the menu item",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
        {
            name: "allergenId",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the allergen",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    summary: "Unlink allergen from a menu item",
    tags: ["MenuItemAllergen"],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(MenuItemAllergenResponseSchema, "Unlinked successfully", StatusCodes.OK),
})

menuItemAllergenRouter.delete("/menu-item-allergen/item/:menuItemId/allergen/:allergenId", verifyJWT, checkRole(["ADMIN"]), menuItemAllergenController.unlink);

menuItemAllergenRegistry.registerPath({
    method: "get",
    path: "/api/menu-item-allergen/item/{menuItemId}",
    parameters: [
        {
            name: "menuItemId",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the menu item",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    summary: "Get all allergens linked to a menu item",
    tags: ["MenuItemAllergen"],
    responses: createApiResponse(MenuItemAllergenResponseSchema.array(), "Allergens retrieved successfully", StatusCodes.OK),
});

menuItemAllergenRouter.get("/item/:menuItemId", menuItemAllergenController.getByMenuItem);