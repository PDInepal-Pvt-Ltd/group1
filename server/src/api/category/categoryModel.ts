import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const categorySchema = z.object({
  id: z.string().openapi({
    description: "Unique identifier for the category",
    example: "123e4567-e89b-12d3-a456-426655440000",
  }),
  name: z.string().openapi({
    description: "Category name",
    example: "Drinks",
  }),
  imageUrl: z.string().url().nullable().openapi({
    description: "Category image URL",
    example: "https://res.cloudinary.com/demo/image/upload/v123/drinks.png",
  }),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1).openapi({
    description: "Category name",
    example: "Drinks",
  }),
  imageUrl: z.string().url().nullable().optional().openapi({
    description: "Category image URL",
    example: "https://res.cloudinary.com/demo/image/upload/v123/drinks.png",
  }),
});

export const UpdateCategorySchema = z.object({
  name: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const CategoryResponseSchema = categorySchema;

export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
