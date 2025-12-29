import { OrderStatus } from "@/generated/prisma/enums";

// Define the valid "Next" states for any given current state
export const KDS_STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.PENDING], // Allow move back to pending if mistake
    [OrderStatus.READY]: [OrderStatus.SERVED, OrderStatus.PREPARING],
    [OrderStatus.SERVED]: [], // Terminal state
    [OrderStatus.CANCELLED]: [], // Terminal state
};