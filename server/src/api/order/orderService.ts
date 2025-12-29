import { StatusCodes } from "http-status-codes";
import type { CreateOrder, CreateOrderItem, OrderResponse, UpdateOrder } from "./orderModel";
import { OrderRepository } from "./orderRepository";
import { TableRepository } from "../table/tableRepository";
import { UserRepository } from "../user/userRepository";
import { MenuItemRepository } from "../menuItem/menuItemRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import logger from "@/common/utils/logger";
import { OrderStatus, Prisma, TableStatus } from "@/generated/prisma/client";
import { BadRequestError } from "@/common/utils/customError";
import { ORDER_AUDIT_ACTIONS } from "@/common/constants/orderAuditAction";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export class OrderService {
    private orderRepository: OrderRepository;
    private tableRepository: TableRepository;
    private userRepository: UserRepository;
    private menuItemRepository: MenuItemRepository;
    private auditLogQueue = new AuditLogQueue();

    constructor(
        orderRepository: OrderRepository = new OrderRepository(),
        tableRepository: TableRepository = new TableRepository(),
        userRepository: UserRepository = new UserRepository(),
        menuItemRepository: MenuItemRepository = new MenuItemRepository()
    ) {
        this.orderRepository = orderRepository;
        this.tableRepository = tableRepository;
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
    }

    async createOrder(data: CreateOrder, actorId?: string): Promise<ServiceResponse<OrderResponse | null>> {
        try {
            const table = await this.tableRepository.findById(data.tableId);

            if (!table || table.status === TableStatus.RESERVED || table.status === TableStatus.OCCUPIED || table.status === TableStatus.NEEDS_CLEANING) {
                return ServiceResponse.failure("Requested table is not available", null, StatusCodes.BAD_REQUEST);
            }

            let createdBy = data.createdBy ?? actorId;

            if (createdBy) {
                const user = await this.userRepository.findById(createdBy);
                if (!user || !["WAITER", "CASHIER"].includes(user.role)) {
                    return ServiceResponse.failure(`Assigned waiter ${data.createdBy} does not exist`, null, StatusCodes.BAD_REQUEST);
                }
            }

            const menuItemIds = data.items.map((item) => item.menuItemId);
            const menuItems = await this.menuItemRepository.findAvailableByIds(menuItemIds);

            if (menuItems.length !== menuItemIds.length) {
                return ServiceResponse.failure("Some menu items are not available or do not exist", null, StatusCodes.BAD_REQUEST);
            }

            const menuItemMap = new Map(menuItems.map((menuItem) => [menuItem.id, menuItem]));

            const orderItemsData = data.items.map((item) => {
                const menuItem = menuItemMap.get(item.menuItemId)!;
                let unitPrice = menuItem.price;
                const activeSurplus = menuItem.surplusMarks?.[0];
                if (activeSurplus) {
                    const discountMultiplier = new Prisma.Decimal(1).minus(new Prisma.Decimal(activeSurplus.discountPct).dividedBy(100));
                    unitPrice = unitPrice.times(discountMultiplier).toDecimalPlaces(2);
                }
                const discountAmount = item.discountAmount;
                const subTotalBeforeDiscount = new Prisma.Decimal(item.qty).times(unitPrice);
                const subTotalAfterDiscount = subTotalBeforeDiscount.minus(discountAmount);
                if (subTotalAfterDiscount.lte(0)) {
                    throw new BadRequestError(`Subtotal after discount for item ${item.menuItemId} is less than or equal to zero`);
                }

                if( discountAmount.greaterThan(subTotalBeforeDiscount)) {
                    throw new BadRequestError(`Discount amount for item ${item.menuItemId} is greater than the subtotal before discount`);
                }
                return {
                    menuItemId: item.menuItemId,
                    qty: item.qty,
                    unitPrice: unitPrice,
                    subTotal: subTotalAfterDiscount,
                    notes: item.notes,
                    payerName: item.payerName,
                    discountAmount: discountAmount,
                };
            });

            const orderSubTotal = orderItemsData.reduce((acc, item) => acc.plus(item.subTotal), new Prisma.Decimal(0));

            const order = await this.orderRepository.createOrder(data, orderSubTotal, orderItemsData, createdBy);

            await this.auditLogQueue.add("createAuditLog", {
                userId: data.createdBy,
                action: ORDER_AUDIT_ACTIONS.CREATED,
                resourceType: "Order",
                resourceId: order.id,
                payload: {
                    orderId: order.id,
                    tableId: order.tableId,
                    subTotal: order.subTotal,
                },
                ip: null,
                userAgent: null,
            })
            return ServiceResponse.success<OrderResponse>("Order created successfully", order, StatusCodes.CREATED);
        } catch (error) {
            if (error instanceof BadRequestError) {
                return ServiceResponse.failure(error.message, null, StatusCodes.BAD_REQUEST);
            } else if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
                return ServiceResponse.failure("Order conflict (e.g., duplicate)", null, StatusCodes.CONFLICT);
            } else if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
                return ServiceResponse.failure("Resource not found", null, StatusCodes.NOT_FOUND);
            }
            logger.error("Error creating Order:", error);
            return ServiceResponse.failure("Error creating Order", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getOrderById(orderId: string): Promise<ServiceResponse<OrderResponse | null>> {
        try {
            const order = await this.orderRepository.findOrderById(orderId);
            if (!order) {
                return ServiceResponse.failure("Order not found", null, StatusCodes.NOT_FOUND);
            }
            return ServiceResponse.success<OrderResponse>("Order found successfully", order, StatusCodes.OK);
        } catch (error) {
            logger.error("Error getting order by id:", error);
            return ServiceResponse.failure("Error getting order by id", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllOrders(): Promise<ServiceResponse<OrderResponse[] | null>> {
        try {
            const orders = await this.orderRepository.findAllOrders();
            return ServiceResponse.success<OrderResponse[]>("Orders found successfully", orders, StatusCodes.OK);
        } catch (error) {
            logger.error("Error getting all orders:", error);
            return ServiceResponse.failure("Error getting all orders", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async updateOrder(orderId: string, data: UpdateOrder, actorId?: string): Promise<ServiceResponse<OrderResponse | null>> {
    try {
        const existingOrder = await this.orderRepository.findOrderById(orderId);
        if (!existingOrder) {
            return ServiceResponse.failure("Order not found", null, StatusCodes.NOT_FOUND);
        }

        const terminalStatuses: OrderStatus[] = ['SERVED', 'CANCELLED'];
        if (terminalStatuses.includes(existingOrder.status)) {
            return ServiceResponse.failure(`Cannot update an order that is already ${existingOrder.status}`, null, StatusCodes.BAD_REQUEST);
        }

       let totalAddition = new Prisma.Decimal(0);
        let processedNewItems: CreateOrderItem[] = [];

       if (data.items && data.items.length > 0) {
            const menuItems = await this.menuItemRepository.findAvailableByIds(data.items.map(i => i.menuItemId));
            if (menuItems.length !== data.items.length) {
                return ServiceResponse.failure("One or more menu items are unavailable", null, StatusCodes.BAD_REQUEST);
            }

            const itemMap = new Map(menuItems.map(mi => [mi.id, mi]));

            processedNewItems = data.items.map(item => {
                const menu = itemMap.get(item.menuItemId)!;
                let unitPrice = menu.price;

                const activeSurplus = menu.surplusMarks?.[0];
                if (activeSurplus) {
                    const multiplier = new Prisma.Decimal(1).minus(new Prisma.Decimal(activeSurplus.discountPct).dividedBy(100));
                    unitPrice = unitPrice.times(multiplier).toDecimalPlaces(2);
                }

                const discount = new Prisma.Decimal(item.discountAmount || 0);
                const subTotal = new Prisma.Decimal(item.qty).times(unitPrice).minus(discount);

                if (subTotal.lte(0)) throw new BadRequestError(`Invalid pricing for ${menu.id}`);

                totalAddition = totalAddition.plus(subTotal);

                return {
                    ...item,
                    unitPrice,
                    subTotal,
                    discountAmount: discount
                };
            });
        }

        const updatedOrder = await this.orderRepository.updateOrder(
            orderId,
            data,
            totalAddition,
            processedNewItems,
            actorId
        );

        await this.auditLogQueue.add("createAuditLog", {
            userId: actorId,
            action: ORDER_AUDIT_ACTIONS.UPDATED,
            resourceType: "Order",
            resourceId: orderId,
           payload: { 
                prevStatus: existingOrder.status, 
                newStatus: data.status, 
                itemsAdded: processedNewItems.length 
            },
            ip: null,
            userAgent: null,
        });

        return ServiceResponse.success("Order updated successfully", updatedOrder, StatusCodes.OK);
    } catch (error) {
        logger.error(`Error updating order ${orderId}:`, error);
        return ServiceResponse.failure("Internal Server Error", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

    async deleteOrder(orderId: string): Promise<ServiceResponse<OrderResponse | null>> {
        try {
            const order = await this.orderRepository.findOrderById(orderId);
            if (!order) {
                return ServiceResponse.failure("Order not found", null, StatusCodes.NOT_FOUND);
            }
            const deletedOrder = await this.orderRepository.deleteOrder(orderId);
            return ServiceResponse.success<OrderResponse>("Order deleted successfully", deletedOrder, StatusCodes.OK);
        } catch (error) {
            logger.error("Error deleting order:", error);
            return ServiceResponse.failure("Error deleting order", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}
export const orderService = new OrderService();