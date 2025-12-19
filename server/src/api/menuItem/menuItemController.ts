import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { CreateMenuItemSchema, MenuItemResponse, UpdateMenuItemSchema } from "./menuItemModel";
import { menuItemService } from "./menuItemService";

class MenuItemController {
    public createMenuItem: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(
                ServiceResponse.failure("You do not have permission to perform this action", null, 403),
                res
            );
        }
        const userId = req.user.id;
        const menuImage = req.file;
        if(!menuImage){
            return handleServiceResponse(
                ServiceResponse.failure("Menu image is required", null, 400),
                res
            );
        }
        const data = CreateMenuItemSchema.parse(req.body);
        const serviceResponse: ServiceResponse<MenuItemResponse | null> = await menuItemService.createMenuItem(data, menuImage, userId);
        return handleServiceResponse(serviceResponse, res);
    }

    public getMenuItemById: RequestHandler = async (req: Request, res: Response) => {
        const menuItemId = req.params.id;
        const serviceResponse: ServiceResponse<MenuItemResponse | null> = await menuItemService.getMenuItemById(menuItemId);
        return handleServiceResponse(serviceResponse, res);
    }

    public getAllMenuItems: RequestHandler = async (req: Request, res: Response) => {
        const serviceResponse: ServiceResponse<MenuItemResponse[] | null> = await menuItemService.getAllMenuItems();
        return handleServiceResponse(serviceResponse, res);
    }

    public getAvailableMenuItems: RequestHandler = async (req: Request, res: Response) => {
        const serviceResponse: ServiceResponse<MenuItemResponse[] | null> = await menuItemService.getAvailableMenuItems();
        return handleServiceResponse(serviceResponse, res);
    }

    public getMenuItemByCategory: RequestHandler = async (req: Request, res: Response) => {
        const categoryId = req.params.id;
        const serviceResponse: ServiceResponse<MenuItemResponse[] | null> = await menuItemService.getMenuItemByCategory(categoryId);
        return handleServiceResponse(serviceResponse, res);
    }

    public updateMenuItem: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(
                ServiceResponse.failure("You do not have permission to perform this action", null, 403),
                res
            );
        }
        const menuItemId = req.params.id;
        const data = UpdateMenuItemSchema.parse(req.body);
        const serviceResponse: ServiceResponse<MenuItemResponse | null> = await menuItemService.updateMenuItem(menuItemId, data);
        return handleServiceResponse(serviceResponse, res);
    }

    public updateMenuItemImage: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(
                ServiceResponse.failure("You do not have permission to perform this action", null, 403),
                res
            );
        }
        const menuItemId = req.params.id;
        const menuImage = req.file;
        if(!menuImage){
            return handleServiceResponse(
                ServiceResponse.failure("Menu image is required", null, 400),
                res
            );
        }
        const serviceResponse: ServiceResponse<MenuItemResponse | null> = await menuItemService.updateMenuItemImage(menuItemId, menuImage);
        return handleServiceResponse(serviceResponse, res);
    }

    public deleteMenuItem: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(
                ServiceResponse.failure("You do not have permission to perform this action", null, 403),
                res
            );
        }
        const menuItemId = req.params.id;
        const serviceResponse: ServiceResponse<MenuItemResponse | null> = await menuItemService.deleteMenuItem(menuItemId);
        return handleServiceResponse(serviceResponse, res);
    }   
}

export const menuItemController = new MenuItemController();