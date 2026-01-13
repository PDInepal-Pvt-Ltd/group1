import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { TableStatus } from "@/generated/prisma/enums";

extendZodWithOpenApi(z);
// model Table {
//   id         String     @id @default(uuid())
//   createdAt  DateTime   @default(now())
//   updatedAt  DateTime   @updatedAt
//   deletedAt  DateTime?  // Soft delete
//   name       String
//   seats      Int
//   status     TableStatus @default(AVAILABLE)
//   assignedTo String?     // FK to User.id (nullable)

//   // Relations
//   assignedWaiter User?        @relation("WaiterAssignedTables", fields: [assignedTo], references: [id], onDelete: SetNull, onUpdate: Cascade)
//   reservations   Reservation[]
//   orders         Order[]

//   @@unique([name]) // Ensure unique table naming for this deployment (adjust if multi-tenant later)
//   @@index([status, assignedTo])
//   @@index([deletedAt])
// }
export const tableSchema = z.object({
    id: z.string().openapi({ description: "Unique identifier for the table",example: "123e4567-e89b-12d3-a456-426655440000"}),
    createdAt: z.date().openapi({ description: "Timestamp when the table was created",example: "2024-01-01T12:00:00Z"}),
    updatedAt: z.date().openapi({ description: "Timestamp when the table was last updated",example: "2024-01-01T12:00:00Z"}),
    deletedAt: z.date().nullable().openapi({ description: "Timestamp when the table was deleted",example: "2024-01-01T12:00:00Z"}),
    name: z.string().openapi({ description: "Name of the table",example: "Table 1"}),
    seats: z.number().openapi({ description: "Number of seats on the table",example: 4}),
    qrCodeUrl: z.string().nullable().openapi({ description: "URL of the QR code for the table",example: "https://example.com/qr-code/123e4567-e89b-12d3-a456-426655440000"}),
    status: z.enum(TableStatus).default(TableStatus.AVAILABLE).openapi({ description: "Status of the table",example: "AVAILABLE"}),
    assignedTo: z.string().nullable().openapi({ description: "ID of the user assigned to the table",example: "123e4567-e89b-12d3-a456-426655440000"}),
});

export const CreateTableSchema = tableSchema.pick({
    name: true,
    seats: true,
    status: true,
});

export const UpdateTableSchema = tableSchema.pick({
    name: true,
    seats: true,
    status: true,
});

export const TableResponseSchema = tableSchema.pick({
    id: true,
    name: true,
    seats: true,
    status: true,
    assignedTo: true,
    qrCodeUrl: true
});

export const AssignWaiterSchema = z.object({
    waiterId: z.string().openapi({ description: "ID of the waiter to assign the table to",example: "123e4567-e89b-12d3-a456-426655440000"}),
});

export type Table = z.infer<typeof tableSchema>;
export type CreateTable = z.infer<typeof CreateTableSchema>;
export type UpdateTable = z.infer<typeof UpdateTableSchema>;
export type TableResponse = z.infer<typeof TableResponseSchema>;    
export type AssignWaiter = z.infer<typeof AssignWaiterSchema>;