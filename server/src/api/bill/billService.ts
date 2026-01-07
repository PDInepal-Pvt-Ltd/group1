import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { BillRepository } from "./billRepository";
import { DiscountType, PaymentMode } from "@/generated/prisma/enums";
import { OrderRepository } from "../order/orderRepository";
import logger from "@/common/utils/logger";
import { BillResponse, CreateBill, DailyReport } from "./billModel";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import { BILL_AUDIT_ACTIONS } from "@/common/constants/billAuditAction";
import { Prisma } from "@/generated/prisma/client";
import { billGenerateService } from "@/common/services/billGenerateService";
import { startOfDay, endOfDay } from "date-fns";

export class BillService {
    private TAX_RATE = new Prisma.Decimal(13);
    private SERVICE_CHARGE = new Prisma.Decimal(5);
    private auditLogQueue = new AuditLogQueue();
    private billRepository: BillRepository;
    private orderRepository: OrderRepository;

    constructor(
        billRepository: BillRepository = new BillRepository(),
        orderRepository: OrderRepository = new OrderRepository()
    ) {
        this.billRepository = billRepository;
        this.orderRepository = orderRepository;
    }

    async createBill(data: CreateBill, userId: string): Promise<ServiceResponse<BillResponse | null>> {
        try {
            const order = await this.orderRepository.findOrderById(data.orderId);
            if (!order) {
                return ServiceResponse.failure("Order not found to create Bill", null, StatusCodes.NOT_FOUND);
            }
            let subTotal = order.subTotal;
            let discountAmount = new Prisma.Decimal(0);

            if (data.discountValue.greaterThan(0)) {
                discountAmount = data.discountType === DiscountType.PERCENTAGE
                    ? subTotal.times(data.discountValue.dividedBy(100))
                    : data.discountValue;
            }

            subTotal = subTotal.minus(discountAmount);
            const taxableAmount = subTotal.minus(discountAmount).plus(this.SERVICE_CHARGE);
            const taxAmount = taxableAmount.times(this.TAX_RATE.dividedBy(100));
            const grandTotal = taxableAmount.plus(taxAmount);

            const bill = await this.billRepository.create(data, subTotal, discountAmount, taxAmount, grandTotal, this.TAX_RATE, this.SERVICE_CHARGE, userId);

            const { pdfUrl } = await billGenerateService.generateBill(bill);

            const updatedBill = await this.billRepository.updatePdfUrl(bill.id, pdfUrl);

            if (!updatedBill) {
                return ServiceResponse.failure("Error updating Bill", null, StatusCodes.INTERNAL_SERVER_ERROR);
            }
            await this.auditLogQueue.add("createAuditLog", {
                userId: userId,
                action: BILL_AUDIT_ACTIONS.BILL_CREATED,
                resourceType: "Bill",
                resourceId: updatedBill.id,
                payload: updatedBill,
                ip: null,
                userAgent: null,
            });

            return ServiceResponse.success<BillResponse>("Bill created successfully", updatedBill, StatusCodes.CREATED);

        } catch (error) {
            logger.error("Error creating Bill:", error);
            return ServiceResponse.failure("Error creating Bill", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getBillById(id: string): Promise<ServiceResponse<BillResponse | null>> {
        const bill = await this.billRepository.findById(id);
        if (!bill) return ServiceResponse.failure("Bill not found", null, StatusCodes.NOT_FOUND);
        return ServiceResponse.success("Bill retrieved", bill);
    }

    async getAllBills(): Promise<ServiceResponse<BillResponse[]>> {
        const bills = await this.billRepository.findAll();
        return ServiceResponse.success("Bills retrieved", bills);
    }

    async confirmPayment(billId: string, userId: string): Promise<ServiceResponse<BillResponse | null>> {
        try {
            const bill = await this.billRepository.findById(billId);
            if (!bill) return ServiceResponse.failure("Bill not found", null, StatusCodes.NOT_FOUND);
            if (bill.isPaid) return ServiceResponse.failure("Bill is already paid", null, StatusCodes.BAD_REQUEST);

            const updatedBill = await this.billRepository.markAsPaid(billId);

            await this.auditLogQueue.add("createAuditLog", {
                userId,
                action: BILL_AUDIT_ACTIONS.BILL_PAID,
                resourceType: "Bill",
                resourceId: billId,
                payload: { isPaid: true },
            });

            return ServiceResponse.success("Payment confirmed", updatedBill);
        } catch (error) {
            return ServiceResponse.failure("Error confirming payment", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getDailyRevenueReport(date: Date): Promise<ServiceResponse<DailyReport | null>> {
        try {
            const start = startOfDay(date);
            const end = endOfDay(date);

            const { aggregations, paymentModeBreakdown } = await this.billRepository.getDailyStats(start, end);

            const report: DailyReport = {
                date: date.toISOString().split('T')[0],
                totalRevenue: Number(aggregations._sum.grandTotal || 0),
                totalOrders: aggregations._count.id,
                taxCollected: Number(aggregations._sum.taxAmount || 0),
                serviceCharges: Number(aggregations._sum.serviceCharge || 0),
                discountsGiven: Number(aggregations._sum.discountValue || 0),
                breakdownByPaymentMode: paymentModeBreakdown.map(item => ({
                    paymentMode: item.paymentMode,
                    amount: Number(item._sum.grandTotal || 0),
                    count: item._count.id
                }))
            };

            return ServiceResponse.success("Daily report generated", report);
        } catch (error) {
            logger.error("Error generating daily report:", error);
            return ServiceResponse.failure("Failed to generate report", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const billService = new BillService();