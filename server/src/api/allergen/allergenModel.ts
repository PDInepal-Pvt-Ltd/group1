import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const allergenSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the allergen", example: "123e4567-e89b-12d3-a456-426655440000" }),
    name: z.string().min(1).openapi({ description: "Name of the allergen", example: "Peanuts" }),
});

export const CreateAllergenSchema = allergenSchema.pick({
    name: true,
});

export const UpdateAllergenSchema = allergenSchema.pick({
    name: true,
});

export const AllergenResponseSchema = allergenSchema;

export type Allergen = z.infer<typeof allergenSchema>;
export type CreateAllergen = z.infer<typeof CreateAllergenSchema>;
export type UpdateAllergen = z.infer<typeof UpdateAllergenSchema>;
export type AllergenResponse = z.infer<typeof AllergenResponseSchema>;