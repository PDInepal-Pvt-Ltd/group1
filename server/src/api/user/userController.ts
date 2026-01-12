import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { CreateUserSchema, ForgotPasswordSchema, LoginResponse, LoginUserSchema, ResetPasswordSchema, UpdateUserSchema, UserResponse } from "./userModel";
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

    public refreshSession: RequestHandler = async (req: Request, res: Response) => {
        const refreshToken = req.body.refreshToken as string;
        const ip = req.ip;
        const userAgent = req.headers["user-agent"];
        const serviceResponse: ServiceResponse<{ accessToken: string, refreshToken: string } | null> = await userService.refreshSession(refreshToken, ip, userAgent);
        return handleServiceResponse(serviceResponse, res);
    }

    public logoutUser: RequestHandler = async (req: Request, res: Response) => {
        const refreshToken = req.body.refreshToken as string;

        const accessToken = req.headers.authorization?.replace("Bearer ", "").trim();

        if (!accessToken) {
            return handleServiceResponse(
                ServiceResponse.failure("Unauthorized", null, StatusCodes.UNAUTHORIZED),
                res
            );
        }

        const serviceResponse: ServiceResponse<null> = await userService.logoutUser(refreshToken,accessToken);
        return handleServiceResponse(serviceResponse, res);
    }

    public getUserById: RequestHandler = async (req:Request, res:Response) => {
        const serviceResponse: ServiceResponse<UserResponse | null> = await userService.getUserById(req.params.id);
        return handleServiceResponse(serviceResponse, res);
    }

    public getAllUsers: RequestHandler = async (req:Request, res: Response) => {
        const serviceResponse: ServiceResponse<UserResponse[] | null> = await userService.getAllUsers();
        return handleServiceResponse(serviceResponse, res);
    }

    public updateUser: RequestHandler = async (req:Request, res:Response) => {
        const data = UpdateUserSchema.parse(req.body);
        const serviceResponse: ServiceResponse<UserResponse | null> = await userService.updateUser(req.params.id,data);
        return handleServiceResponse(serviceResponse,res);
    }

    public deleteUser: RequestHandler = async (req:Request, res:Response) => {
        const serviceResponse: ServiceResponse<UserResponse | null> = await userService.deleteUser(req.params.id);
        return handleServiceResponse(serviceResponse,res);

    }

    public forgotPassword: RequestHandler = async (req:Request, res:Response) => {
        const data = ForgotPasswordSchema.parse(req.body);
        const serviceResponse: ServiceResponse<null> = await userService.forgotPassword(data);
        return handleServiceResponse(serviceResponse,res);
    }

    public resetPassword: RequestHandler = async (req:Request, res:Response) => {
        const data = ResetPasswordSchema.parse(req.body);
        const serviceResponse: ServiceResponse<null> = await userService.resetPassword(req.params.token,data);
        return handleServiceResponse(serviceResponse,res);
    }

    public getMe: RequestHandler = async (req:Request, res:Response) => {
        const user = req.user;
        if (!user) {
            return handleServiceResponse(ServiceResponse.failure("Unauthorized", null, StatusCodes.UNAUTHORIZED), res);
        }
        const serviceResponse: ServiceResponse<UserResponse | null> = await userService.getUserById(user.id);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const userController = new UserController();