import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { MenuItemAllergenRepository } from "./menuItemAllergenRepository";
import { LinkAllergen, MenuItemAllergenResponse } from "./menuItemAllergenModel";
import logger from "@/common/utils/logger";

export class MenuItemAllergenService {
    private repository: MenuItemAllergenRepository;

    constructor(repository: MenuItemAllergenRepository = new MenuItemAllergenRepository()) {
        this.repository = repository;
    }

    async linkAllergensToItem(data: LinkAllergen): Promise<ServiceResponse<MenuItemAllergenResponse[] | null>> {
        try {
            const linkedAllergens = await this.repository.linkAllergens(data);
            return ServiceResponse.success<MenuItemAllergenResponse[]>("Allergens linked successfully", linkedAllergens, StatusCodes.OK);
        } catch (error) {
            logger.error("Error linking allergens:", error);
            return ServiceResponse.failure("Error linking allergens", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getByMenuItem(menuItemId: string): Promise<ServiceResponse<MenuItemAllergenResponse[] | null>> {
        try {
            const data = await this.repository.findByMenuItem(menuItemId);
            return ServiceResponse.success("Allergens retrieved", data, StatusCodes.OK);
        } catch (error) {
            return ServiceResponse.failure("Error fetching linked allergens", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async unlink(menuItemId: string, allergenId: string): Promise<ServiceResponse<null>> {
        try {
            await this.repository.unlinkAllergen(menuItemId, allergenId);
            return ServiceResponse.success("Allergen unlinked", null, StatusCodes.OK);
        } catch (error) {
            return ServiceResponse.failure("Error unlinking allergen", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const menuItemAllergenService = new MenuItemAllergenService();