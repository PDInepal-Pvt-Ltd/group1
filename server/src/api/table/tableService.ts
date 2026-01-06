import { StatusCodes } from "http-status-codes";
import type { TableResponse,CreateTable, UpdateTable } from "./tableModel";
import { TableRepository } from "./tableRepository";
import { UserRepository } from "../user/userRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import { TABLE_AUDIT_ACTIONS } from "@/common/constants/tableAuditActions";
import logger from "@/common/utils/logger";
import { TableStatus } from "@/generated/prisma/enums";
import { qrCodeService } from "@/common/services/qrCodeService";

export class TableService {
    private auditLogQueue = new AuditLogQueue();
    private tableRepository: TableRepository;
    private userRepository: UserRepository;

    constructor(
        tableRepository: TableRepository = new TableRepository(),
        userRepository: UserRepository = new UserRepository()
    ) {
        this.tableRepository = tableRepository;
        this.userRepository = userRepository;
    }

    async createTable(data: CreateTable,userId: string): Promise<ServiceResponse<TableResponse | null>> {
        try {
            if(data.assignedTo){
                const user = await this.userRepository.findById(data.assignedTo);
                if(!user){
                    return ServiceResponse.failure(`Assigned waiter ${data.assignedTo} does not exist`, null, StatusCodes.BAD_REQUEST);
                }
            }
            const table = await this.tableRepository.createTable(data);

            const qrCode = await qrCodeService.generateTableQrCode(table.id);
            if (qrCode) {
                await this.tableRepository.updateTableQrCode(table.id, qrCode);
            }
            await this.auditLogQueue.add("createAuditLog", {
                userId,
                action: TABLE_AUDIT_ACTIONS.TABLE_CREATED,
                resourceType: "Table",
                resourceId: table.id,
                payload: table,
                ip: null,
                userAgent: null,
            });
            return ServiceResponse.success<TableResponse>("Table created successfully", table, StatusCodes.CREATED);
        } catch (error) {
            logger.error("Error creating user:", error);
            return ServiceResponse.failure("Error creating Table", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getTableById(tableId: string): Promise<ServiceResponse<TableResponse | null>> {
        try {
            const table = await this.tableRepository.findById(tableId);
            if (!table) {
                return ServiceResponse.failure("Table not found", null, StatusCodes.NOT_FOUND);
            }
            return ServiceResponse.success<TableResponse>("Table found successfully", table, StatusCodes.OK);
        } catch (error) {
            logger.error("Error getting table by id:", error);
            return ServiceResponse.failure("Error getting table by id", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllTables(): Promise<ServiceResponse<TableResponse[] | null>> {
        try {
            const tables = await this.tableRepository.findAll();
            return ServiceResponse.success<TableResponse[]>("Tables found successfully", tables, StatusCodes.OK);
        } catch (error) {
            logger.error("Error getting all tables:", error);
            return ServiceResponse.failure("Error getting all tables", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async assignTableToWaiter(tableId: string, waiterId: string, userId: string): Promise<ServiceResponse<TableResponse | null>> {
        try {
            const user = await this.userRepository.findById(waiterId);
            if(!user){
                return ServiceResponse.failure(`Assigned waiter ${waiterId} does not exist`, null, StatusCodes.BAD_REQUEST);
            }
            const table = await this.tableRepository.assignTableToWaiter(tableId, waiterId);
            await this.auditLogQueue.add("createAuditLog", {
                userId,
                action: TABLE_AUDIT_ACTIONS.TABLE_ASSIGNED_WAITER,
                resourceType: "Table",
                resourceId: table.id,
                payload: table,
                ip: null,
                userAgent: null,
            });
            return ServiceResponse.success<TableResponse>("Table assigned to waiter successfully", table, StatusCodes.OK);
        } catch (error) {
            logger.error("Error assigning table to waiter:", error);
            return ServiceResponse.failure("Error assigning table to waiter", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async unassignTableFromWaiter(tableId: string, userId: string): Promise<ServiceResponse<TableResponse | null>> {
        try {
            const table = await this.tableRepository.unassignTableFromWaiter(tableId);
            await this.auditLogQueue.add("createAuditLog", {
                userId,
                action: TABLE_AUDIT_ACTIONS.TABLE_UNASSIGNED_WAITER,
                resourceType: "Table",
                resourceId: table.id,
                payload: table,
                ip: null,
                userAgent: null,
            });
            return ServiceResponse.success<TableResponse>("Table unassigned from waiter successfully", table, StatusCodes.OK);
        } catch (error) {
            logger.error("Error unassigning table from waiter:", error);
            return ServiceResponse.failure("Error unassigning table from waiter", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async updateTableStatus(tableId: string, status: TableStatus, userId: string): Promise<ServiceResponse<TableResponse | null>> {
        try {
            const table = await this.tableRepository.updateTableStatus(tableId, status);
            await this.auditLogQueue.add("createAuditLog", {
                userId,
                action: TABLE_AUDIT_ACTIONS.TABLE_STATUS_CHANGED,
                resourceType: "Table",
                resourceId: table.id,
                payload: table,
                ip: null,
                userAgent: null,
            });
            return ServiceResponse.success<TableResponse>("Table status updated successfully", table, StatusCodes.OK);
        } catch (error) {
            logger.error("Error updating table status:", error);
            return ServiceResponse.failure("Error updating table status", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async updateTable(tableId: string, data: UpdateTable, userId: string): Promise<ServiceResponse<TableResponse | null>> {
        try {
            if(data.assignedTo){
                const user = await this.userRepository.findById(data.assignedTo);
                if(!user){
                    return ServiceResponse.failure(`Assigned waiter ${data.assignedTo} does not exist`, null, StatusCodes.BAD_REQUEST);
                }
            }
            const table = await this.tableRepository.updateTable(tableId, data);
            await this.auditLogQueue.add("createAuditLog", {
                userId,
                action: TABLE_AUDIT_ACTIONS.TABLE_UPDATED,
                resourceType: "Table",
                resourceId: table.id,
                payload: table,
                ip: null,
                userAgent: null,
            });
            return ServiceResponse.success<TableResponse>("Table updated successfully", table, StatusCodes.OK);
        } catch (error) {
            logger.error("Error updating table:", error);
            return ServiceResponse.failure("Error updating table", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async findAvailableTablesBySeats(requiredSeats: number): Promise<ServiceResponse<TableResponse[] | null>> {
       try {
        const availableTables = await this.tableRepository.findAvailableTablesBySeats(requiredSeats);
        if(availableTables.length === 0){
         return ServiceResponse.failure(`No available tables with at least ${requiredSeats} seats`, null, StatusCodes.NOT_FOUND);
        }
        return ServiceResponse.success<TableResponse[]>(`Available tables with at least ${requiredSeats} seats`, availableTables, StatusCodes.OK);
       } catch (error) {
        logger.error("Error finding available tables:", error);
        return ServiceResponse.failure("Error finding available tables", null, StatusCodes.INTERNAL_SERVER_ERROR);
       }
    }

    async deleteTable(tableId: string, userId: string): Promise<ServiceResponse<null>> {
        try {
            await this.tableRepository.deleteTable(tableId);
            await this.auditLogQueue.add("createAuditLog", {
                userId,
                action: TABLE_AUDIT_ACTIONS.TABLE_DELETED,
                resourceType: "Table",
                resourceId: tableId,
                payload: null,
                ip: null,
                userAgent: null,
            });
            return ServiceResponse.success<null>("Table deleted successfully", null, StatusCodes.OK);
        } catch (error) {
            logger.error("Error deleting table:", error);
            return ServiceResponse.failure("Error deleting table", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const tableService = new TableService();