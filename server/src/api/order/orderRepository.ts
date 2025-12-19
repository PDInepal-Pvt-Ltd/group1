import { prisma } from "@/common/lib/prisma";
import { CreateOrder, CreateOrderItem, OrderResponse } from "./orderModel";
import { OrderStatus, Prisma, TableStatus } from "@/generated/prisma/client";

export class OrderRepository {
    async createOrder(data: CreateOrder, orderSubTotal: Prisma.Decimal, orderItemsData: CreateOrderItem[], actorId?: string): Promise<OrderResponse> {
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
                    items: true,
                },
            });
        },{
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        });
    }
}
