import { prisma } from "@/common/lib/prisma";
import { CreateSurplusMark, SurplusMark, SurplusMarkResponse } from "./surplusModel";
import { Prisma } from "@/generated/prisma/client";

export class SurplusRepository {
    async createSurplusMark(surplusMark: CreateSurplusMark, markedBy: string): Promise<SurplusMarkResponse> {
        const surplusMarkResponse = await prisma.surplusMark.create({
            data: {
                ...surplusMark,
                markedBy,
            },
            include: {
                menuItem: {
                    select: {
                        name: true,
                        price: true,
                        imageUrl: true,
                        description: true
                    }
                }
            }
        });
        return surplusMarkResponse;
    }

    async findOverlappingMark(menuItemId: string, start: Date, end: Date): Promise<boolean> {
        const overlap = await prisma.surplusMark.findFirst({
            where: {
                menuItemId,
                deletedAt: null,
                OR: [
                    {
                        // New sale starts during an existing sale
                        surplusAt: { lte: end },
                        surplusUntil: { gte: start }
                    }
                ]
            }
        });
        return !!overlap;
    }

    async findSurplusMarkByMenuItemId(menuItemId: string): Promise<{ discountPct: Prisma.Decimal } | null> {
        const surplusMark = await prisma.surplusMark.findFirst({
            where: {
                menuItemId,
                surplusAt: { lte: new Date() },
                surplusUntil: { gte: new Date() },
                deletedAt: null
            },
            select: {
                discountPct: true
            }
        });

        return surplusMark;
    }

    async findActiveSurplusMark(): Promise<SurplusMarkResponse[] | null> {
        return prisma.surplusMark.findMany({
            where: {
                deletedAt: null,
                surplusAt: { lte: new Date() },
                surplusUntil: { gte: new Date() },
                menuItem: {
                    isAvailable: true
                },
            },
            include: {
                menuItem: {
                    select: {
                        name: true,
                        price: true,
                        imageUrl: true,
                        description: true
                    }
                }
            },
            orderBy: {
                surplusUntil: "asc"
            }
        });
    }

    async updateSurplusMark(surplusMarkId: string, data: CreateSurplusMark, markedBy: string): Promise<SurplusMarkResponse> {
        return prisma.surplusMark.update({
            where: { id: surplusMarkId },
            data: { ...data, markedBy },
            include: {
                menuItem: {
                    select: {
                        name: true,
                        price: true,
                        imageUrl: true,
                        description: true
                    }
                }
            }
        });
    }

    async deleteSurplusMark(surplusMarkId: string, deletedBy: string): Promise<SurplusMarkResponse> {
        return prisma.surplusMark.update({
            where: { id: surplusMarkId },
            data: { deletedAt: new Date(), deletedBy },
            include: {
                menuItem: {
                    select: {
                        name: true,
                        price: true,
                        imageUrl: true,
                        description: true
                    }
                }
            }
        });
    }

    async findSurplusMarkById(surplusMarkId: string): Promise<SurplusMarkResponse | null> {
        return prisma.surplusMark.findUnique({
            where: { id: surplusMarkId },
            include: {
                menuItem: {
                    select: {
                        name: true,
                        price: true,
                        imageUrl: true,
                        description: true
                    }
                }
            }
        });
    }
}