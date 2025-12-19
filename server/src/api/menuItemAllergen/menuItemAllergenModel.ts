import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const menuItemAllergenSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the menu item allergen", example: "123e4567-e89b-12d3-a456-426655440000" }),
    menuItemId: z.string().openapi({ description: "Unique identifier for the menu item", example: "123e4567-e89b-12d3-a456-426655440000" }),
    allergenId: z.string().openapi({ description: "Unique identifier for the allergen", example: "123e4567-e89b-12d3-a456-426655440000" }),
});

export const LinkAllergenSchema = z.object({
    menuItemId: z.string().openapi({ description: "Unique identifier for the menu item", example: "123e4567-e89b-12d3-a456-426655440000" }),
    allergenIds: z.array(z.string()).min(1, "Provide at least one allergen ID").openapi({ description: "Unique identifiers for the allergens", example: ["123e4567-e89b-12d3-a456-426655440000", "123e4567-e89b-12d3-a456-426655440001"] }),
});

export const MenuItemAllergenResponseSchema = menuItemAllergenSchema.extend({
    allergen: z.object({
        name: z.string().openapi({ description: "Name of the allergen", example: "Peanuts" }),
    }).optional(),
});

export type LinkAllergen = z.infer<typeof LinkAllergenSchema>;
export type MenuItemAllergenResponse = z.infer<typeof MenuItemAllergenResponseSchema>;