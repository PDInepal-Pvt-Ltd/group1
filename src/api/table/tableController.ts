import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { CreateTableSchema, UpdateTableSchema, AssignWaiterSchema, TableResponse } from "./tableModel";
import { tableService } from "./tableService";

class TableController {
    public createTable: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(
                ServiceResponse.failure("You do not have permission to perform this action", null, 403),
                res
            );
        }        
        const userId = req.user.id;
        const data = CreateTableSchema.parse(req.body);
        const serviceResponse: ServiceResponse<TableResponse | null> = await tableService.createTable(data, userId);
        return handleServiceResponse(serviceResponse, res);
    }

    public assignTableToWaiter: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(
                ServiceResponse.failure("You do not have permission to perform this action", null, 403),
                res
            );
        }        
        const userId = req.user.id;
        const { waiterId } = AssignWaiterSchema.parse(req.body);
        const tableId = req.params.id;        
        const serviceResponse: ServiceResponse<TableResponse | null> = await tableService.assignTableToWaiter(tableId, waiterId, userId);
        return handleServiceResponse(serviceResponse, res);
    }

    public updateTable: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(
                ServiceResponse.failure("You do not have permission to perform this action", null, 403),
                res
            );
        }
        const userId = req.user.id;
        const tableId = req.params.id;
        const data = UpdateTableSchema.parse(req.body);
        const serviceResponse: ServiceResponse<TableResponse | null> = await tableService.updateTable(tableId, data, userId);
        return handleServiceResponse(serviceResponse, res);
    }

    public deleteTable: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(
                ServiceResponse.failure("You do not have permission to perform this action", null, 403),
                res
            );
        }
        const userId = req.user.id;
        const tableId = req.params.id;
        const serviceResponse: ServiceResponse<TableResponse | null> = await tableService.deleteTable(tableId, userId);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const tableController = new TableController();