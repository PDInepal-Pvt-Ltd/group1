import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { CreateMenuItemSchema, MenuItemResponse } from "./menuItemModel";
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
}

export const menuItemController = new MenuItemController();