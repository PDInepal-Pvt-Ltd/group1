import { Prisma } from "@/generated/prisma/client";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const menuItemSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the menu item", example: "123e4567-e89b-12d3-a456-426655440000" }),
    createdAt: z.date().openapi({ description: "Timestamp when the menu item was created", example: "2024-01-01T12:00:00Z" }),
    updatedAt: z.date().openapi({ description: "Timestamp when the menu item was last updated", example: "2024-01-01T12:00:00Z" }),
    deletedAt: z.date().nullable().openapi({ description: "Timestamp when the menu item was deleted", example: "2024-01-01T12:00:00Z" }),
    name: z.string().openapi({ description: "Name of the menu item", example: "Burger" }),
    description: z.string().nullable().openapi({ description: "Description of the menu item", example: "A juicy burger with lettuce, tomato, and cheese" }),
    price: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ example: 9.99 }),
    imageUrl: z.string().nullable().openapi({ description: "URL of the image for the menu item", example: "https://example.com/burger.jpg" }),
    isAvailable: z.boolean().openapi({ description: "Whether the menu item is available or not", example: true }),
    isVeg: z.boolean().openapi({ description: "Whether the menu item is vegetarian or not", example: false }),
    categoryId: z.string().openapi({ description: "ID of the category to which the menu item belongs", example: "123e4567-e89b-12d3-a456-426655440000" }),
});

export const CreateMenuItemSchema = menuItemSchema.pick({
    name: true,
    description: true,
    price: true,
    isAvailable: true,
    isVeg: true,
    categoryId: true,
});

export const UpdateMenuItemSchema = menuItemSchema.pick({
    name: true,
    description: true,
    price: true,
    isAvailable: true,
    isVeg: true,
    categoryId: true,
});

export const MenuItemAllergenRelationSchema = z.object({
    allergen: z.object({
        id: z.string(),
        name: z.string(),
    }),
});

export const MenuItemResponseSchema = menuItemSchema.pick({
    id: true,
    name: true,
    description: true,
    price: true,
    imageUrl: true,
    isAvailable: true,
    isVeg: true,
    categoryId: true,
}).extend({
    allergens: z.array(MenuItemAllergenRelationSchema).optional(),
})

export type MenuItem = z.infer<typeof menuItemSchema>;
export type CreateMenuItem = z.infer<typeof CreateMenuItemSchema>;
export type UpdateMenuItem = z.infer<typeof UpdateMenuItemSchema>;
export type MenuItemResponse = z.infer<typeof MenuItemResponseSchema>;