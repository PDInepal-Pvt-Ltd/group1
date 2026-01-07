import { prisma } from "@/common/lib/prisma";
import { CreateKdsEvent, KdsEventResponse } from "./kdsEventModel";
import { OrderStatus } from "@/generated/prisma/enums";

export class KdsEventRepository {
    async create(data: CreateKdsEvent, actorId: string, minutesSpent?: number): Promise<KdsEventResponse> {
    return prisma.$transaction(async (tx) => {
        await tx.order.update({
            where: { id: data.orderId },
            data: { status: data.status as OrderStatus } // Ensure types match
        });

        return tx.kdsEvent.create({
            data: {
                ...data,
                actorId,
                minutesSpent,
                timestamp: new Date(),
            },
            include: {
                order: {
                    include: {
                        items: {
                            include: { menuItem: true },
                        },
                    },
                },
            },
        });
    });
}

    async getLatestEventForOrder(orderId: string): Promise<KdsEventResponse | null> {
        return prisma.kdsEvent.findFirst({
            where: { orderId, deletedAt: null },
            orderBy: { timestamp: 'desc' },
            include: { order: { include: { items: { include: { menuItem: true } } } } },
        });
    }

    async getActiveKitchenQueue(): Promise<any[]> {
        return prisma.order.findMany({
            where: {
                status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY] },
                deletedAt: null
            },
            include: {
                items: { include: { menuItem: true } },
                kdsEvents: { orderBy: { timestamp: 'desc' }, take: 1 }
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    async findByOrderId(orderId: string): Promise<KdsEventResponse[]> {
        return prisma.kdsEvent.findMany({
            where: { orderId, deletedAt: null },
            orderBy: { timestamp: "asc" },
            include: { order: { include: { items: { include: { menuItem: true } } } } },
        });
    }

    async getTimeline(orderId: string): Promise<KdsEventResponse[]> {
        return prisma.kdsEvent.findMany({
            where: { orderId, deletedAt: null },
            orderBy: { timestamp: 'asc' },
            include: { order: { include: { items: { include: { menuItem: true } } } } },
        });
    }

    async getPerformanceStats(startDate: Date, endDate: Date) {
        return prisma.kdsEvent.groupBy({
            by: ['actorId'],
            where: {
                timestamp: { gte: startDate, lte: endDate },
                minutesSpent: { not: null },
                deletedAt: null,
                status: OrderStatus.SERVED
            },
            _avg: { minutesSpent: true },
            _count: { id: true },
            _max: { minutesSpent: true }
        });
    }

    async findById(id: string): Promise<KdsEventResponse | null> {
        return prisma.kdsEvent.findUnique({
            where: { id, deletedAt: null },
            include: { order: { include: { items: { include: { menuItem: true } } } } },
        });
    }
}