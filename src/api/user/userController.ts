import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { CreateUserSchema, LoginResponse, LoginUserSchema, UserResponse } from "./userModel";
import { userService } from "./userService";
import { StatusCodes } from "http-status-codes";

class UserController {
    public createUser: RequestHandler = async (req: Request, res: Response) => {
        const data = CreateUserSchema.parse(req.body);
        const serviceResponse: ServiceResponse<UserResponse | null> = await userService.createUser(data);
        return handleServiceResponse(serviceResponse, res);
    }

    public loginUser: RequestHandler = async (req: Request, res: Response) => {
        const data = LoginUserSchema.parse(req.body);
        const ip = req.ip;
        const userAgent = req.headers["user-agent"];

        const serviceResponse: ServiceResponse<LoginResponse | null> = await userService.loginUser(data, ip, userAgent);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const userController = new UserController();