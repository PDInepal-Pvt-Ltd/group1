import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { OrderStatus } from "@/generated/prisma/enums";

extendZodWithOpenApi(z);

export const kdsEventSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the KDS event", example: "123e4567-e89b-12d3-a456-426655440000" }),
    createdAt: z.date().openapi({ description: "Timestamp when the event record was created", example: "2024-01-01T12:00:00Z" }),
    deletedAt: z.date().nullable().openapi({ description: "Timestamp when the event record was deleted", example: "2024-01-01T12:00:00Z" }),
    orderId: z.string().openapi({ description: "ID of the associated order", example: "order_123" }),
    status: z.enum(OrderStatus).openapi({ description: "The status changed to in this event", example: "PENDING" }),
    timestamp: z.date().openapi({ description: "When the event actually occurred" }),
    minutesSpent: z.number().nullable().openapi({ description: "Minutes elapsed since last status", example: 5 }),
    actorId: z.string().nullable().openapi({ description: "ID of the user who triggered the event" }),
    notes: z.string().nullable().openapi({ description: "Optional notes about the event", example: "Customer requested extra spicy" }),
});

export const CreateKdsEventSchema = kdsEventSchema.pick({
    orderId: true,
    status: true,
    notes: true,
    actorId: true,
    minutesSpent: true
})

export const KdsStatsSchema = z.object({
    averagePrepTime: z.number().openapi({ description: "Average minutes spent in PREPARING status" }),
    totalOrdersProcessed: z.number(),
    statusCounts: z.record(z.string(), z.number()),
});

export const KdsEventResponseSchema = kdsEventSchema.omit({ deletedAt: true });

export const KdsPerformanceSchema = z.object({
    averagePrepTime: z.number().openapi({ description: "Average minutes from PENDING to READY" }),
    totalCompleted: z.number(),
    longestPrepTime: z.number(),
    efficiencyByActor: z.array(z.object({
        actorId: z.string(),
        avgMinutes: z.number(),
        count: z.number()
    })).openapi({ description: "Breakdown of performance per chef/user" })
});

export type KdsPerformance = z.infer<typeof KdsPerformanceSchema>;

export type KdsEvent = z.infer<typeof kdsEventSchema>;
export type CreateKdsEvent = z.infer<typeof CreateKdsEventSchema>;
export type KdsEventResponse = z.infer<typeof KdsEventResponseSchema>;