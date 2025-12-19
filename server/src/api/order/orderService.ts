import { StatusCodes } from "http-status-codes";
import type { CreateOrder, OrderResponse } from "./orderModel";
import { OrderRepository } from "./orderRepository";
import { TableRepository } from "../table/tableRepository";
import { UserRepository } from "../user/userRepository";
import { MenuItemRepository } from "../menuItem/menuItemRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import logger from "@/common/utils/logger";
import { Prisma, Role, TableStatus } from "@/generated/prisma/client";
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
                const unitPrice = menuItem.price;
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


}
export const orderService = new OrderService();