import { prisma } from "@/common/lib/prisma";
import { TableResponse, CreateTable, UpdateTable } from "./tableModel";
import { TableStatus } from "@/generated/prisma/enums";

export class TableRepository {
    async createTable(data: CreateTable): Promise<TableResponse> {
        return prisma.table.create({
            data,
            select: {
                id: true,
                name: true,
                seats: true,
                status: true,
                assignedTo: true,
                qrCodeUrl: true
            }
        });
    }

    async findById(tableId: string): Promise<TableResponse | null> {
        return prisma.table.findUnique({
            where: { id: tableId },
            select: {
                id: true,
                name: true,
                seats: true,
                status: true,
                assignedTo: true,
                qrCodeUrl: true
            }
        });
    }

    async findAll(): Promise<TableResponse[]> {
        return prisma.table.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                seats: true,
                status: true,
                assignedTo: true,
                qrCodeUrl: true
            }
        });
    }

    async assignTableToWaiter(tableId: string, waiterId: string): Promise<TableResponse> {
        return prisma.table.update({
            where: { id: tableId },
            data: { assignedTo: waiterId },
            select: {
                id: true,
                name: true,
                seats: true,
                status: true,
                assignedTo: true,
                qrCodeUrl: true
            }
        });
    }

    async unassignTableFromWaiter(tableId: string): Promise<TableResponse> {
        return prisma.table.update({
            where: { id: tableId },
            data: { assignedTo: null },
            select: {
                id: true,
                name: true,
                seats: true,
                status: true,
                assignedTo: true,
                qrCodeUrl: true
            }
        });
    }

    async updateTableStatus(tableId: string, status: TableStatus): Promise<TableResponse> {
        return prisma.table.update({
            where: { id: tableId },
            data: { status },
            select: {
                id: true,
                name: true,
                seats: true,
                status: true,
                assignedTo: true,
                qrCodeUrl: true
            }
        });
    }

    async updateTable(tableId: string, data: UpdateTable): Promise<TableResponse> {
        return prisma.table.update({
            where: { id: tableId },
            data,
            select: {
                id: true,
                name: true,
                seats: true,
                status: true,
                assignedTo: true,
                qrCodeUrl: true
            }
        });
    }

    async deleteTable(tableId: string): Promise<TableResponse> {
        return prisma.table.update({
            where: { id: tableId },
            data: { deletedAt: new Date() },
            select: {
                id: true,
                name: true,
                seats: true,
                status: true,
                assignedTo: true,
                qrCodeUrl: true
            }
        });
    }

    async findAvailableTablesBySeats(requiredSeats: number): Promise<TableResponse[]> {
        return prisma.table.findMany({
            where: {
                deletedAt: null,
                status: 'AVAILABLE',
                seats: {
                    gte: requiredSeats,
                },
            },
            orderBy: {
                seats: 'asc',
            },
            select: {
                id: true,
                name: true,
                seats: true,
                status: true,
                assignedTo: true,
                qrCodeUrl: true
            }
        });
    }

    async updateTableQrCode(tableId: string, qrCodeUrl: string): Promise<TableResponse> {
        return prisma.table.update({
            where: { id: tableId },
            data: { qrCodeUrl },
            select: {
                id: true,
                name: true,
                seats: true,
                status: true,
                assignedTo: true,
                qrCodeUrl: true
            }
        });
    }
}