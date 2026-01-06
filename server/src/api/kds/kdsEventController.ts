import { Request, RequestHandler, Response } from "express";
import { handleServiceResponse, ServiceResponse } from "@/common/utils/serviceResponse";
import { CreateKdsEventSchema } from "./kdsEventModel";
import { kdsEventService } from "./kdsEventService";

class KdsEventController {
    public createEvent: RequestHandler = async (req: Request, res: Response) => {
        const actorId = req.user?.id;
        if (!actorId) {
            return handleServiceResponse(ServiceResponse.failure("Forbidden", null, 403), res);
        }
        const data = CreateKdsEventSchema.parse(req.body);
        const serviceResponse = await kdsEventService.createEvent(data, actorId);
        return handleServiceResponse(serviceResponse, res);
    }

    public getEventsByOrder: RequestHandler = async (req: Request, res: Response) => {
        const orderId = req.params.orderId;
        const serviceResponse = await kdsEventService.getEventsByOrder(orderId);
        return handleServiceResponse(serviceResponse, res);
    }

    public getQueue: RequestHandler = async (_req: Request, res: Response) => {
        const serviceResponse = await kdsEventService.getQueue();
        return handleServiceResponse(serviceResponse, res);
    }

    public getPerformance: RequestHandler = async (req: Request, res: Response) => {
        const days = parseInt(req.query.days as string) || 7;
        const serviceResponse = await kdsEventService.getPerformanceMetrics(days);
        return handleServiceResponse(serviceResponse, res);
    }

    public updateStatus: RequestHandler = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return handleServiceResponse(ServiceResponse.failure("Forbidden", null, 403), res);
        }
        const data = CreateKdsEventSchema.parse(req.body);
        const serviceResponse = await kdsEventService.transitionStatus(data, userId);
        return handleServiceResponse(serviceResponse, res);
    }

    public getTimeline: RequestHandler = async (req: Request, res: Response) => {
        const serviceResponse = await kdsEventService.getTimeline(req.params.orderId);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const kdsEventController = new KdsEventController();