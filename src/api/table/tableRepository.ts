import { prisma } from "@/common/lib/prisma";
import { TableResponse, CreateTable, UpdateTable } from "./tableModel";

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
             }
        });
    }
}