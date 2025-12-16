import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { CreateTableSchema, TableResponse } from "./tableModel";
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
}

export const tableController = new TableController();