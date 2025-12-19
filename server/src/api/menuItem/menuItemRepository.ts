import { prisma } from "@/common/lib/prisma";
import { MenuItemResponse, CreateMenuItem, UpdateMenuItem } from "./menuItemModel";
import { Prisma } from "@/generated/prisma/client";

export class MenuItemRepository {
    async createMenuItem(data: CreateMenuItem, imageUrl: string): Promise<MenuItemResponse> {
        return prisma.menuItem.create({
            data: { ...data, imageUrl },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                categoryId: true,
                isAvailable: true,
                isVeg: true,
                imageUrl: true,
            }
        });
    }

    async findById(menuItemId: string): Promise<MenuItemResponse | null> {
        return prisma.menuItem.findUnique({
            where: { id: menuItemId },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                isAvailable: true,
                isVeg: true,
                categoryId: true,
                allergens: {
                    select: {
                        allergen: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
    }

    async findAll(): Promise<MenuItemResponse[]> {
        return prisma.menuItem.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                isAvailable: true,
                isVeg: true,
                categoryId: true,
                allergens: {
                    select: {
                        allergen: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
    }

    async findAvailableByIds(menuItemIds: string[]): Promise<Array<{ id: string; price: Prisma.Decimal }>> {
        return prisma.menuItem.findMany({
            where: { 
                id: {
                    in: menuItemIds
                },
                isAvailable: true,
                deletedAt: null
            },
            select: {
                id: true,
                price: true
            }
        })   
    }

    async findByCategory(categoryId: string): Promise<MenuItemResponse[]> {
        return prisma.menuItem.findMany({
            where: { categoryId },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                isAvailable: true,
                isVeg: true,
                categoryId: true,
            }
        });
    }

    async updateMenuItem(menuItemId: string, data: UpdateMenuItem): Promise<MenuItemResponse> {
        return prisma.menuItem.update({
            where: { id: menuItemId },
            data,
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                isAvailable: true,
                isVeg: true,
                categoryId: true,
            }
        });
    }

    async updateMenuItemImage(menuItemId: string, imageUrl: string): Promise<MenuItemResponse> {
        return prisma.menuItem.update({
            where: { id: menuItemId },
            data: { imageUrl },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                isAvailable: true,
                isVeg: true,
                categoryId: true,
            }
        });
    }

    async deleteMenuItem(menuItemId: string): Promise<MenuItemResponse> {
        return prisma.menuItem.update({
            where: { id: menuItemId },
            data: { deletedAt: new Date() },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                isAvailable: true,
                isVeg: true,
                categoryId: true,
            }
        });
    }
}