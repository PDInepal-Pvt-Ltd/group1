import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { menuItemSchema } from "../menuItem/menuItemModel";
import { z } from "zod";

extendZodWithOpenApi(z);

export const orderItemSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the order item", example: "123e4567-e89b-12d3-a456-426655440000" }),
    createdAt: z.date().openapi({ description: "Timestamp when the order item was created", example: "2024-01-01T12:00:00Z" }),
    updatedAt: z.date().openapi({ description: "Timestamp when the order item was last updated", example: "2024-01-01T12:00:00Z" }),
    deletedAt: z.date().nullable().openapi({ description: "Timestamp when the order item was deleted", example: "2024-01-01T12:00:00Z" }),
    orderId: z.string().openapi({ description: "ID of the order this item belongs to", example: "123e4567-e89b-12d3-a456-426655440000" }),
    menuItemId: z.string().openapi({ description: "ID of the menu item", example: "123e4567-e89b-12d3-a456-426655440000" }),
    qty: z.number().int().positive().openapi({ description: "Quantity of the menu item ordered", example: 2 }),
    unitPrice: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Price per unit at the time of order", example: 9.99 }),
    subTotal: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Subtotal for this item (qty * unitPrice)", example: 19.98 }),
    notes: z.string().nullable().openapi({ description: "Additional notes for the order item" }),
    payerName: z.string().nullable().openapi({ description: "Name of the payer for split billing" }),
    discountAmount: z.union([z.string(), z.number()]).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Discount applied to this item", example: 0 }),
});


export const CreateOrderItemSchema = z.object({
  menuItemId: z.string(),
  qty: z.number().int().positive(),
  notes: z.string().nullable().optional(),
  payerName: z.string().nullable().optional(),
});

export const CreateOrderSchema = z.object({
  tableId: z.string(),
  isQrOrder: z.boolean().optional().default(false),
  placedBy: z.string().nullable().optional().default(null),
  qrSession: z.string().nullable().optional().default(null),
  notes: z.string().nullable().optional().default(null),
  createdBy: z.string().nullable().optional().default(null),
  items: z.array(CreateOrderItemSchema).min(1),
});

export type CalculatedOrderItem = {
  menuItemId: string;
  qty: number;
  unitPrice: Prisma.Decimal;
  subTotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  notes?: string | null;
  payerName?: string | null;
};

export const orderSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the order", example: "123e4567-e89b-12d3-a456-426655440000" }),
    createdAt: z.date().openapi({ description: "Order creation timestamp", example: "2024-01-01T12:00:00Z" }),
    updatedAt: z.date().openapi({ description: "Order last updated timestamp", example: "2024-01-01T12:00:00Z" }),
    deletedAt: z.date().nullable().openapi({ description: "Order deletion timestamp", example: "2024-01-01T12:00:00Z" }),
    tableId: z.string().openapi({ description: "ID of the table associated with this order", example: "123e4567-e89b-12d3-a456-426655440000" }),
    status: z.enum(OrderStatus).openapi({ description: "Current status of the order", example: "PENDING" }),
    placedBy: z.string().nullable().openapi({ description: "Customer name or QR reference", example: "John Doe" }),
    qrSession: z.string().nullable().openapi({ description: "Optional QR session ID", example: "123e4567-e89b-12d3-a456-426655440000" }),
    notes: z.string().nullable().openapi({ description: "Additional notes for the order", example: "Special instructions" }),
    createdBy: z.string().nullable().openapi({ description: "User ID who created the order (POS or waiter)", example: "123e4567-e89b-12d3-a456-426655440000" }),
    isQrOrder: z.boolean().openapi({ description: "Whether the order was placed via QR code", example: true }),
    subTotal: z.union([z.string(), z.number()]).refine((val) => !isNaN(Number(val)), { message: "Subtotal must be a number" }).transform((val) => new Prisma.Decimal(val)).openapi({ description: "Order subtotal", example: 19.99 }),
    items: z.array(CreateOrderItemSchema).min(1).openapi({ description: "List of items in the order", example: [{ menuItemId: "123e4567-e89b-12d3-a456-426655440000", qty: 2, unitPrice: 9.99, subTotal: 19.98 }] }),
});

export const UpdateOrderSchema = z.object({
    status: z.enum(OrderStatus).optional(),
    notes: z.string().nullable().optional(),
    items: z.array(CreateOrderItemSchema).optional(),
});

export const OrderItemWithMenuSchema = orderItemSchema.extend({
  menuItem: menuItemSchema,
});

export const OrderResponseSchema = orderSchema.extend({
    items: z.array(OrderItemWithMenuSchema),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type CreateOrderItem = z.infer<typeof CreateOrderItemSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
