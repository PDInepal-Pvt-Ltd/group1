import { prisma } from "@/common/lib/prisma";
import { MenuItemResponse, CreateMenuItem } from "./menuItemModel";

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
            }
        });
    }
}