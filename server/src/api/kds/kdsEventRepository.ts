import { prisma } from "@/common/lib/prisma";
import { CreateKdsEvent, KdsEventResponse } from "./kdsEventModel";
import { OrderStatus } from "@/generated/prisma/enums";
import { time } from "node:console";

export class KdsEventRepository {
    async create(data: CreateKdsEvent, actorId: string, minutesSpent?: number): Promise<KdsEventResponse> {
        return prisma.kdsEvent.create({
            data: { ...data, actorId, minutesSpent, timestamp: new Date() },
            select: {
                id: true,
                createdAt: true,
                orderId: true,
                status: true,
                timestamp: true,
                minutesSpent: true,
                actorId: true,
                notes: true,
            }
        });
    }

    async getLatestEventForOrder(orderId: string): Promise<KdsEventResponse | null> {
        return prisma.kdsEvent.findFirst({
            where: { orderId, deletedAt: null },
            orderBy: { timestamp: 'desc' }
        });
    }

    async getActiveKitchenQueue(): Promise<any[]> {
        return prisma.order.findMany({
            where: {
                status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING] },
                deletedAt: null
            },
            include: {
                items: true,
                kdsEvents: { orderBy: { timestamp: 'desc' }, take: 1 }
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    async findByOrderId(orderId: string): Promise<KdsEventResponse[]> {
        return prisma.kdsEvent.findMany({
            where: { orderId, deletedAt: null },
            orderBy: { timestamp: "asc" },
        });
    }

    async getTimeline(orderId: string): Promise<KdsEventResponse[]> {
        return prisma.kdsEvent.findMany({
            where: { orderId, deletedAt: null },
            orderBy: { timestamp: 'asc' }
        });
    }

    async getPerformanceStats(startDate: Date, endDate: Date) {
        return prisma.kdsEvent.groupBy({
            by: ['actorId'],
            where: {
                createdAt: { gte: startDate, lte: endDate },
                minutesSpent: { not: null },
                deletedAt: null
            },
            _avg: { minutesSpent: true },
            _count: { id: true },
            _max: { minutesSpent: true }
        });
    }

    async findById(id: string): Promise<KdsEventResponse | null> {
        return prisma.kdsEvent.findUnique({
            where: { id, deletedAt: null },
        });
    }
}