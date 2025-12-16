import { prisma } from "@/common/lib/prisma";
import { TableResponse, CreateTable } from "./tableModel";

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
}