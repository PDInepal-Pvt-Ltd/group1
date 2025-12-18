import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { CreateAllergenSchema, UpdateAllergenSchema } from "./allergenModel";
import { allergenService } from "./allergenService";

class AllergenController {
    public createAllergen: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(ServiceResponse.failure("Forbidden", null, 403), res);
        }
        const data = CreateAllergenSchema.parse(req.body);
        const serviceResponse = await allergenService.createAllergen(data);
        return handleServiceResponse(serviceResponse, res);
    }

    public getAllAllergens: RequestHandler = async (_req: Request, res: Response) => {
        const serviceResponse = await allergenService.getAllAllergens();
        return handleServiceResponse(serviceResponse, res);
    }

    public getAllergenById: RequestHandler = async (req: Request, res: Response) => {
        const serviceResponse = await allergenService.getAllergenById(req.params.id);
        return handleServiceResponse(serviceResponse, res);
    }

    public updateAllergen: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(ServiceResponse.failure("Forbidden", null, 403), res);
        }
        const data = UpdateAllergenSchema.parse(req.body);
        const serviceResponse = await allergenService.updateAllergen(req.params.id, data);
        return handleServiceResponse(serviceResponse, res);
    }

    public deleteAllergen: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(ServiceResponse.failure("Forbidden", null, 403), res);
        }
        const serviceResponse = await allergenService.deleteAllergen(req.params.id);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const allergenController = new AllergenController();