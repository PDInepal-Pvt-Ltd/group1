import { prisma } from "@/common/lib/prisma";
import { CalculatedOrderItem, CreateOrder, CreateOrderItem, OrderResponse, UpdateOrder } from "./orderModel";
import { OrderStatus, Prisma, TableStatus } from "@/generated/prisma/client";

export class OrderRepository {
    async createOrder(data: CreateOrder, orderSubTotal: Prisma.Decimal, orderItemsData: CalculatedOrderItem[], actorId?: string): Promise<OrderResponse> {
        return prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    tableId: data.tableId,
                    placedBy: data.placedBy,
                    qrSession: data.qrSession,
                    notes: data.notes,
                    createdBy: data.createdBy,
                    isQrOrder: data.isQrOrder,
                    subTotal: orderSubTotal,
                    status: OrderStatus.PENDING,
                }
            });

            await tx.orderItem.createMany({
                data: orderItemsData.map((item) => ({
                    orderId: createdOrder.id,
                    menuItemId: item.menuItemId,
                    qty: item.qty,
                    unitPrice: item.unitPrice,
                    subTotal: item.subTotal,
                    notes: item.notes,
                    payerName: item.payerName,
                    discountAmount: item.discountAmount,
                })),
            });

            await tx.kdsEvent.create({
                data: {
                    status: OrderStatus.PENDING,
                    orderId: createdOrder.id,
                    actorId: actorId,
                    timestamp: new Date(),
                },
            });

            await tx.table.update({
                where: {
                    id: data.tableId,
                },
                data: {
                    status: TableStatus.OCCUPIED,
                },
            })

            return tx.order.findUniqueOrThrow({
                where: {
                    id: createdOrder.id,
                },
                include: {
                    items: {
                        include: {
                            menuItem: true
                        }
                    }
                },
            });
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        });
    }

    async findOrderById(id: string): Promise<OrderResponse | null> {
        return prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                }
            },
        });
    }

    async findAllOrders(): Promise<OrderResponse[]> {
        return prisma.order.findMany({
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                }
            },
        });
    }

    async updateOrder(
    id: string,
    data: UpdateOrder,
    totalAddition: Prisma.Decimal,
    newItems: CalculatedOrderItem[],
    actorId?: string
): Promise<OrderResponse> {
    return prisma.$transaction(async (tx) => {
        const current = await tx.order.findUnique({ where: { id }, select: { status: true, subTotal: true } });
        if (!current) throw new Error("Order vanished during transaction");
        
        if (current.status === "CANCELLED") throw new Error("Order was cancelled by another user");

        const updatedOrder = await tx.order.update({
            where: { id },
            data: {
                status: data.status,
                notes: data.notes,
                subTotal: { increment: totalAddition },
            },
        });

        if (newItems.length > 0) {
            await tx.orderItem.createMany({
                data: newItems.map((item) => ({
                    orderId: id,
                    menuItemId: item.menuItemId,
                    qty: item.qty,
                    unitPrice: item.unitPrice,
                    subTotal: item.subTotal,
                    notes: item.notes,
                    payerName: item.payerName,
                    discountAmount: item.discountAmount,
                })),
            });
        }

        if (data.status || newItems.length > 0) {
            await tx.kdsEvent.create({
                data: {
                    status: data.status ?? updatedOrder.status,
                    orderId: id,
                    actorId: actorId,
                    timestamp: new Date(),
                },
            });
        }

        return tx.order.findUniqueOrThrow({
            where: { id },
            include: { items: { include: { menuItem: true } } },
        });
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
}

    async deleteOrder(id: string): Promise<OrderResponse> {
        return prisma.order.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                }
            },
        })
    }
}
