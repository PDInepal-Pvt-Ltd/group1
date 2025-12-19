import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ReservationStatus } from "@/generated/prisma/client";
import { z } from "zod";

extendZodWithOpenApi(z);

export const reservationSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the reservation", example: "123e4567-e89b-12d3-a456-426655440000" }),
    createdAt: z.date().openapi({ description: "Timestamp when the reservation was created", example: "2024-01-01T12:00:00Z" }),
    updatedAt: z.date().openapi({ description: "Timestamp when the reservation was last updated", example: "2024-01-01T12:00:00Z" }),
    deletedAt: z.date().nullable().openapi({ description: "Timestamp when the reservation was deleted", example: "2024-01-01T12:00:00Z" }),
    tableId: z.string().openapi({ description: "ID of the table associated with the reservation", example: "123e4567-e89b-12d3-a456-426655440000" }),
    guestName: z.string().openapi({ description: "Name of the guest", example: "John Doe" }),
    guestPhone: z.string().nullable().openapi({ description: "Phone number of the guest", example: "+1234567890" }),
    guests: z.number().openapi({ description: "Number of guests in the reservation", example: 2 }),
    status: z.enum(ReservationStatus).openapi({ description: "Status of the reservation", example: "ACTIVE" }),
    reservedAt: z.coerce.date().openapi({ description: "Start time of the reservation", example: "2024-01-01T12:00:00Z" }),
    reservedUntil: z.coerce.date().openapi({ description: "End time of the reservation", example: "2024-01-01T12:00:00Z" }),
    durationMin: z.number().default(120).openapi({ description: "Duration of the reservation in minutes", example: 120 }),
    cancelledAt: z.date().nullable().openapi({ description: "Timestamp when the reservation was cancelled", example: "2024-01-01T12:00:00Z" }),
    completedAt: z.date().nullable().openapi({ description: "Timestamp when the reservation was completed", example: "2024-01-01T12:00:00Z" }),
});

export const CreateReservationSchema = reservationSchema.pick({
    tableId: true,
    guestName: true,
    guestPhone: true,
    guests: true,
    status: true,
    reservedAt: true,
    reservedUntil: true,
    durationMin: true,
});

export const UpdateReservationSchema = reservationSchema.pick({
    guestName: true,
    guestPhone: true,
    guests: true,
    status: true,
    reservedAt: true,
    reservedUntil: true,
    durationMin: true,
});

export const ReservationResponseSchema = reservationSchema.pick({
    id: true,
    tableId: true,
    guestName: true,
    guestPhone: true,
    guests: true,
    status: true,
    reservedAt: true,
    reservedUntil: true,
    durationMin: true,
});

export type Reservation = z.infer<typeof reservationSchema>;
export type CreateReservation = z.infer<typeof CreateReservationSchema>;
export type UpdateReservation = z.infer<typeof UpdateReservationSchema>;
export type ReservationResponse = z.infer<typeof ReservationResponseSchema>;