import { prisma } from "@/common/lib/prisma";
import { CreateCategory, UpdateCategory } from "./categoryModel";

export class CategoryRepository {
  create(data: CreateCategory) {
    return prisma.category.create({
      data,
      select: { id: true, name: true, imageUrl: true },
    });
  }

  findAll() {
    return prisma.category.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, imageUrl: true },
      orderBy: { name: "asc" },
    });
  }

  findById(id: string) {
    return prisma.category.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, imageUrl: true },
    });
  }

  update(id: string, data: UpdateCategory) {
    return prisma.category.update({
      where: { id },
      data,
      select: { id: true, name: true, imageUrl: true },
    });
  }

  softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
