import { PaymentMode, Prisma } from "@/generated/prisma/client";
import { BillResponse, CreateBill, DailyReport } from "./billModel";
import { prisma } from "@/common/lib/prisma";

export class BillRepository {
    async create(data: CreateBill, subTotal: Prisma.Decimal, discountAmount: Prisma.Decimal, taxAmount: Prisma.Decimal, grandTotal: Prisma.Decimal, TAX_RATE: Prisma.Decimal, serviceCharge: Prisma.Decimal, userId: string): Promise<BillResponse> {
        const bill = await prisma.bill.create({
            data: {
                ...data,
                invoiceSent: false,
                generatedBy: userId,
                subTotal: subTotal,
                discountValue: discountAmount,
                taxAmount: taxAmount,
                grandTotal: grandTotal,
                taxPct: TAX_RATE,
                serviceCharge
            },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                menuItem: true
                            }
                        }
                    }
                }
            }
        });
        return bill;
    }

    async updatePdfUrl(billId: string, pdfUrl: string): Promise<BillResponse> {
        const bill = await prisma.bill.update({
            where: {
                id: billId
            },
            data: {
                pdfUrl: pdfUrl
            },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                menuItem: true
                            }
                        }
                    }
                }
            }
        });
        return bill;
    }

    async findById(id: string): Promise<BillResponse | null> {
        return await prisma.bill.findUnique({
            where: { id, deletedAt: null },
            include: { order: { include: { items: { include: { menuItem: true } } } } }
        });
    }

    async findAll(): Promise<BillResponse[]> {
        return await prisma.bill.findMany({ include: { order: { include: { items: { include: { menuItem: true } } } } } });
    }

    async markAsPaid(id: string): Promise<BillResponse> {
        return await prisma.bill.update({ where: { id }, data: { isPaid: true , paidAt: new Date()}, include: { order: { include: { items: { include: { menuItem: true } } } } } });
    }

    async getDailyStats(startDate: Date, endDate: Date) {
        const aggregations = await prisma.bill.aggregate({
            where: {
                paidAt: { gte: startDate, lte: endDate },
                isPaid: true,
                deletedAt: null,
            },
            _sum: {
                grandTotal: true,
                taxAmount: true,
                serviceCharge: true,
                discountValue: true,
            },
            _count: {
                id: true,
            },
        });

        const paymentModeBreakdown = await prisma.bill.groupBy({
            by: ['paymentMode'],
            where: {
                paidAt: { gte: startDate, lte: endDate },
                isPaid: true,
                deletedAt: null,
            },
            _sum: { grandTotal: true },
            _count: { id: true },
        });

        return {
            aggregations,
            paymentModeBreakdown,
        };
    }
}