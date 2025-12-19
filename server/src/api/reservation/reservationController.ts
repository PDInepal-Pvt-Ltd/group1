import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { reservationService } from "./reservationService";
import { CreateReservationSchema, UpdateReservationSchema, ReservationResponse } from "./reservationModel";

class ReservationController {
    public createReservation: RequestHandler = async (req: Request, res: Response) => {
        const data = CreateReservationSchema.parse(req.body);
        const serviceResponse: ServiceResponse<ReservationResponse | null> = await reservationService.createReservation(data);
        return handleServiceResponse(serviceResponse, res);
    } 

    public getReservationById: RequestHandler = async (req: Request, res: Response) => {
        const reservationId = req.params.id;
        const serviceResponse: ServiceResponse<ReservationResponse | null> = await reservationService.getReservationById(reservationId);
        return handleServiceResponse(serviceResponse, res);
    }

    public getAllReservations: RequestHandler = async (req: Request, res: Response) => {
        const serviceResponse: ServiceResponse<ReservationResponse[] | null> = await reservationService.getAllReservations();
        return handleServiceResponse(serviceResponse, res);
    }

    public updateReservation: RequestHandler = async (req: Request, res: Response) => {
        const reservationId = req.params.id;
        const data = UpdateReservationSchema.parse(req.body);
        const serviceResponse: ServiceResponse<ReservationResponse | null> = await reservationService.updateReservation(reservationId, data);
        return handleServiceResponse(serviceResponse, res);
    }

    public deleteReservation: RequestHandler = async (req: Request, res: Response) => {
        const reservationId = req.params.id;
        const serviceResponse: ServiceResponse<ReservationResponse | null> = await reservationService.deleteReservation(reservationId);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const reservationController = new ReservationController();