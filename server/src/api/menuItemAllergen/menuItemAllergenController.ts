import { Request, RequestHandler, Response } from "express";
import { ServiceResponse, handleServiceResponse } from "@/common/utils/serviceResponse";
import { LinkAllergenSchema, MenuItemAllergenResponse } from "./menuItemAllergenModel";
import { menuItemAllergenService } from "./menuItemAllergenService";

class MenuItemAllergenController {
    public linkAllergens: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(ServiceResponse.failure("Forbidden", null, 403), res);
        }
        const data = LinkAllergenSchema.parse(req.body);
        const serviceResponse: ServiceResponse<MenuItemAllergenResponse[] | null> = await menuItemAllergenService.linkAllergensToItem(data);
        return handleServiceResponse(serviceResponse, res);
    }

    public getByMenuItem: RequestHandler = async (req: Request, res: Response) => {
        const serviceResponse: ServiceResponse<MenuItemAllergenResponse[] | null> = await menuItemAllergenService.getByMenuItem(req.params.menuItemId);
        return handleServiceResponse(serviceResponse, res);
    }

    public unlink: RequestHandler = async (req: Request, res: Response) => {
        if (!req.user || req.user.role !== "ADMIN") {
            return handleServiceResponse(ServiceResponse.failure("Forbidden", null, 403), res);
        }
        const { menuItemId, allergenId } = req.params;
        const serviceResponse: ServiceResponse<null> = await menuItemAllergenService.unlink(menuItemId, allergenId);
        return handleServiceResponse(serviceResponse, res);
    }
}

export const menuItemAllergenController = new MenuItemAllergenController();