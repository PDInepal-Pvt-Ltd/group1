import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateMenuItemSchema, menuItemSchema, MenuItemResponseSchema, UpdateMenuItemSchema } from "./menuItemModel";
import { StatusCodes } from "http-status-codes";
import { verifyJWT } from "@/common/middleware/verifyJWT";
import { checkRole } from "@/common/middleware/verifyRole";
import { menuItemController } from "./menuItemController";
import { upload } from "@/common/middleware/multer";
import z from "zod";

export const menuItemRegistry = new OpenAPIRegistry();
export const menuItemRouter: Router = Router();

menuItemRegistry.register("MenuItem", menuItemSchema);

menuItemRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

menuItemRegistry.registerPath({
    method: "post",
    path: "/api/menu-item",
    summary: "Create a new menu item",
    tags: ["MenuItem"],
    request: {
        body: {
            description: "Menu item object that needs to be created",
            required: true,
            content: {
                "multipart/form-data": {
                    schema: CreateMenuItemSchema.extend({
                        menuImage: z.custom<Express.Multer.File>().openapi({
                            type: "string",
                            format: "binary",
                            description: "Image file for the menu item",
                        }),
                    }),
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(MenuItemResponseSchema, "Menu item created successfully", StatusCodes.CREATED),
});

menuItemRouter.post("/menu-item", verifyJWT, checkRole(["ADMIN"]), upload.single("menuImage"), menuItemController.createMenuItem);

menuItemRegistry.registerPath({
    method: "get",
    path: "/api/menu-item/{id}",
    summary: "Get menu item by ID",
    tags: ["MenuItem"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the menu item to be retrieved",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    responses: createApiResponse(MenuItemResponseSchema, "Menu item retrieved successfully", StatusCodes.OK),
});

menuItemRouter.get("/menu-item/:id", menuItemController.getMenuItemById);

menuItemRegistry.registerPath({
    method: "get",
    path: "/api/menu-item",
    summary: "Get all menu items",
    tags: ["MenuItem"],
    responses: createApiResponse(MenuItemResponseSchema.array(), "Menu items retrieved successfully", StatusCodes.OK),
});

menuItemRouter.get("/menu-item", menuItemController.getAllMenuItems);

menuItemRegistry.registerPath({
    method: "get",
    path: "/api/menu-item/available",
    summary: "Get all available menu items",
    tags: ["MenuItem"],
    responses: createApiResponse(MenuItemResponseSchema.array(), "Available menu items retrieved successfully", StatusCodes.OK),
});

menuItemRouter.get("/menu-item/available", menuItemController.getAvailableMenuItems);

menuItemRegistry.registerPath({
    method: "get",
    path: "/api/menu-item/category/{id}",
    summary: "Get menu items by category ID",
    tags: ["MenuItem"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the category to filter menu items",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    responses: createApiResponse(MenuItemResponseSchema.array(), "Menu items retrieved successfully", StatusCodes.OK),
});

menuItemRouter.get("/menu-item/category/:id", menuItemController.getMenuItemByCategory);

menuItemRegistry.registerPath({
    method: "put",
    path: "/api/menu-item/{id}",
    summary: "Update menu item by ID",
    tags: ["MenuItem"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the menu item to be updated",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    request: {
        body: {
            description: "Menu item object that needs to be updated",
            required: true,
            content: {
                "application/json": {
                    schema: UpdateMenuItemSchema,
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(MenuItemResponseSchema, "Menu item updated successfully", StatusCodes.OK),
});

menuItemRouter.put("/menu-item/:id", verifyJWT, checkRole(["ADMIN"]), menuItemController.updateMenuItem);

menuItemRegistry.registerPath({
    method: "put",
    path: "/api/menu-item/{id}/image",
    summary: "Update menu item image by ID",
    tags: ["MenuItem"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the menu item to be updated",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    request: {
        body: {
            description: "Menu item image that needs to be updated",
            required: true,
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        menuImage: z.custom<Express.Multer.File>().openapi({
                            type: "string",
                            format: "binary",
                            description: "Image file for the menu item",
                        }),
                    }),
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(MenuItemResponseSchema, "Menu item image updated successfully", StatusCodes.OK),
});

menuItemRouter.put("/menu-item/:id/image", verifyJWT, checkRole(["ADMIN"]), upload.single("menuImage"), menuItemController.updateMenuItemImage);

menuItemRegistry.registerPath({
    method: "delete",
    path: "/api/menu-item/{id}",
    summary: "Delete menu item by ID",
    tags: ["MenuItem"],
    parameters: [
        {
            name: "id",
            in: "path",
            required: true,
            schema: {
                type: "string",
            },
            description: "ID of the menu item to be deleted",
            example: "123e4567-e89b-12d3-a456-426655440000",
        },
    ],
    security: [{ bearerAuth: [] }],
    responses: createApiResponse(MenuItemResponseSchema, "Menu item deleted successfully", StatusCodes.OK),
});

menuItemRouter.delete("/menu-item/:id", verifyJWT, checkRole(["ADMIN"]), menuItemController.deleteMenuItem);