import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { surplusService } from "./surplusService";
import { CreateSurplusMarkSchema, DailySpecialResponse, SurplusMarkResponse } from "./surplusModel";
class SurplusController {
    public createSurplusMark: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user) {
            return handleServiceResponse(ServiceResponse.failure("You are restricted to create a surplus mark", null, 403), res);
        }
        const data = CreateSurplusMarkSchema.parse(req.body);
        const serviceResponse: ServiceResponse<SurplusMarkResponse | null> = await surplusService.createSurplus(data, req.user.id);
        return handleServiceResponse(serviceResponse, res);
    }

    public getActiveSpecials: RequestHandler = async (_req: Request, res: Response) => {
        const serviceResponse: ServiceResponse<SurplusMarkResponse[] | null> = await surplusService.getDailySpecials();
        return handleServiceResponse(serviceResponse, res);
    }

    public getSurplusMarkById: RequestHandler = async (req: Request, res: Response) => {
        const serviceResponse: ServiceResponse<SurplusMarkResponse | null> = await surplusService.getSurplusMarkById(req.params.id);
        return handleServiceResponse(serviceResponse, res);
    }

    public updateSurplusMark: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user) {
            return handleServiceResponse(ServiceResponse.failure("You are restricted to update a surplus mark", null, 403), res);
        }
        const data = CreateSurplusMarkSchema.parse(req.body);
        const serviceResponse: ServiceResponse<SurplusMarkResponse | null> = await surplusService.updateSurplusMark(req.params.id, data, req.user.id);
        return handleServiceResponse(serviceResponse, res);
    }

    public deleteSurplusMark: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user) {
            return handleServiceResponse(ServiceResponse.failure("You are restricted to delete a surplus mark", null, 403), res);
        }
        const serviceResponse: ServiceResponse<SurplusMarkResponse | null> = await surplusService.deleteSurplusMark(req.params.id, req.user.id);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const surplusController = new SurplusController();