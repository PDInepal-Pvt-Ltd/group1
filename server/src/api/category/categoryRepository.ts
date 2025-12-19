import { prisma } from "@/common/lib/prisma";
import { CreateCategory, UpdateCategory, CategoryResponse } from "./categoryModel";

export class CategoryRepository {
  async create(data: CreateCategory): Promise<CategoryResponse> {
    return prisma.category.create({
      data,
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    });
  }

  async findAll(): Promise<CategoryResponse[]> {
    return prisma.category.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string): Promise<CategoryResponse | null> {
    return prisma.category.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    });
  }

  async update(id: string, data: UpdateCategory): Promise<CategoryResponse> {
    return prisma.category.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
