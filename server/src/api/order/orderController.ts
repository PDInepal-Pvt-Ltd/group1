import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { orderService } from "./orderService";
import { CreateOrderSchema, OrderResponse, UpdateOrderSchema } from "./orderModel";

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
    
    public getOrderById: RequestHandler = async (req: Request, res: Response) => {
        const orderId = req.params.id;
        const serviceResponse: ServiceResponse<OrderResponse | null> = await orderService.getOrderById(orderId);
        return handleServiceResponse(serviceResponse, res);
    }

    public getAllOrders: RequestHandler = async (req: Request, res: Response) => {
        const serviceResponse: ServiceResponse<OrderResponse[] | null> = await orderService.getAllOrders();
        return handleServiceResponse(serviceResponse, res);
    }

    public updateOrder: RequestHandler = async (req: Request, res: Response) => {
        const orderId = req.params.id;
        const data = UpdateOrderSchema.parse(req.body);
        const serviceResponse: ServiceResponse<OrderResponse | null> = await orderService.updateOrder(orderId, data);
        return handleServiceResponse(serviceResponse, res);
    }

    public deleteOrder: RequestHandler = async (req: Request, res: Response) => {
        const orderId = req.params.id;
        const serviceResponse: ServiceResponse<OrderResponse | null> = await orderService.deleteOrder(orderId);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const orderController = new OrderController();