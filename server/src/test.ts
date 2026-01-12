import { Prisma } from "@/generated/prisma/client";
import { DiscountType, PaymentMode, OrderStatus } from "@/generated/prisma/enums";
import { BillResponse } from "./api/bill/billModel";

export const MOCK_BILL_DATA: BillResponse = {
    id: "bill_789_xyz",
    createdAt: new Date("2025-12-21T10:00:00Z"),
    updatedAt: new Date("2025-12-21T10:00:00Z"),
    deletedAt: null,
    orderId: "order_123_abc",
    generatedAt: new Date("2025-12-21T10:05:00Z"),
    generatedBy: "Cashier_John_Doe",
    
    // Financials
    subTotal: new Prisma.Decimal(45.50),
    discountValue: new Prisma.Decimal(10), // 10%
    discountType: DiscountType.PERCENTAGE,
    serviceCharge: new Prisma.Decimal(5.00),
    taxPct: new Prisma.Decimal(13.00),
    taxAmount: new Prisma.Decimal(5.91),
    grandTotal: new Prisma.Decimal(46.41),
    
    // Status & Metadata
    paymentMode: PaymentMode.CASH,
    paidAt: new Date("2025-12-21T10:10:00Z"),
    isPaid: true,
    pdfUrl: null,
    invoiceSent: false,

    // Nested Order Data
    order: {
        id: "order_123_abc",
        createdAt: new Date("2025-12-21T09:30:00Z"),
        updatedAt: new Date("2025-12-21T10:00:00Z"),
        deletedAt: null,
        tableId: "table_05",
        status: OrderStatus.SERVED,
        placedBy: "Guest Table 5",
        qrSession: "qr_sess_999",
        notes: "No onions in the burger please",
        createdBy: "waiter_01",
        isQrOrder: true,
        subTotal: new Prisma.Decimal(45.50),
        
        // Order Items
        items: [
            {
                id: "item_01",
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                orderId: "order_123_abc",
                menuItemId: "menu_01",
                qty: 2,
                unitPrice: new Prisma.Decimal(15.00),
                subTotal: new Prisma.Decimal(30.00),
                notes: "Extra spicy",
                payerName: "Alice",
                discountAmount: new Prisma.Decimal(0),
                menuItem: {
                    id: "menu_01",
                    name: "Signature Spicy Wings",
                    description: "6 pieces of buffalo wings with blue cheese dip",
                    price: new Prisma.Decimal(15.00),
                    imageUrl: "https://example.com/wings.jpg",
                    isAvailable: true,
                    isVeg: false,
                    categoryId: "cat_appetizers",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null
                }
            },
            {
                id: "item_02",
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                orderId: "order_123_abc",
                menuItemId: "menu_02",
                qty: 1,
                unitPrice: new Prisma.Decimal(15.50),
                subTotal: new Prisma.Decimal(15.50),
                notes: null,
                payerName: "Bob",
                discountAmount: new Prisma.Decimal(0),
                menuItem: {
                    id: "menu_02",
                    name: "Garden Fresh Salad",
                    description: "Organic greens with balsamic vinaigrette",
                    price: new Prisma.Decimal(15.50),
                    imageUrl: "https://example.com/salad.jpg",
                    isAvailable: true,
                    isVeg: true,
                    categoryId: "cat_salads",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null
                }
            }
        ]
    }
};