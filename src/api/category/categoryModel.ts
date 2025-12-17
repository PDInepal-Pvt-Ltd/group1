import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const categorySchema = z.object({
  id: z.string().uuid().openapi({ example: "uuid" }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  name: z.string().min(1).openapi({ example: "Drinks" }),
  imageUrl: z.string().url().nullable(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().url().nullable().optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const CategoryResponseSchema = categorySchema.pick({
  id: true,
  name: true,
  imageUrl: true,
});

export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

