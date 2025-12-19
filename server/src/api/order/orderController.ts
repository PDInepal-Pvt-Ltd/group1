import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { orderService } from "./orderService";
import { CreateOrderSchema, OrderResponse } from "./orderModel";

class OrderController {
    public createOrder: RequestHandler = async (req: Request, res: Response) => {
        const user = req.user;

        if (!user && !req.body.isQrOrder) {
            return handleServiceResponse(ServiceResponse.failure("Only authenticated users or QR orders are allowed", null, 403), res);
        }
        const data = CreateOrderSchema.parse(req.body);
        const serviceResponse: ServiceResponse<OrderResponse | null> = await orderService.createOrder(data,user?.id);
        return handleServiceResponse(serviceResponse, res);
    } 
}

export const orderController = new OrderController();