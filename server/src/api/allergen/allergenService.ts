import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { AllergenRepository } from "./allergenRepository";
import { AllergenResponse, CreateAllergen, UpdateAllergen } from "./allergenModel";
import logger from "@/common/utils/logger";

export class AllergenService {
    private allergenRepository: AllergenRepository;

    constructor(allergenRepository: AllergenRepository = new AllergenRepository()) {
        this.allergenRepository = allergenRepository;
    }

    async createAllergen(data: CreateAllergen): Promise<ServiceResponse<AllergenResponse | null>> {
        try {
            const allergen = await this.allergenRepository.create(data);
            return ServiceResponse.success<AllergenResponse>("Allergen created successfully", allergen, StatusCodes.CREATED);
        } catch (error) {
            logger.error("Error creating Allergen:", error);
            return ServiceResponse.failure("Error creating Allergen", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllAllergens(): Promise<ServiceResponse<AllergenResponse[] | null>> {
        try {
            const allergens = await this.allergenRepository.findAll();
            return ServiceResponse.success<AllergenResponse[]>("Allergens retrieved successfully", allergens, StatusCodes.OK);
        } catch (error) {
            logger.error("Error fetching Allergens:", error);
            return ServiceResponse.failure("Error fetching Allergens", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllergenById(id: string): Promise<ServiceResponse<AllergenResponse | null>> {
        try {
            const allergen = await this.allergenRepository.findById(id);
            if (!allergen) return ServiceResponse.failure("Allergen not found", null, StatusCodes.NOT_FOUND);
            return ServiceResponse.success<AllergenResponse>("Allergen found", allergen, StatusCodes.OK);
        } catch (error) {
            return ServiceResponse.failure("Error fetching Allergen", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async updateAllergen(id: string, data: UpdateAllergen): Promise<ServiceResponse<AllergenResponse | null>> {
        try {
            const allergen = await this.allergenRepository.update(id, data);
            return ServiceResponse.success<AllergenResponse>("Allergen updated", allergen, StatusCodes.OK);
        } catch (error) {
            return ServiceResponse.failure("Error updating Allergen", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteAllergen(id: string): Promise<ServiceResponse<AllergenResponse | null>> {
        try {
            const allergen = await this.allergenRepository.delete(id);
            return ServiceResponse.success<AllergenResponse>("Allergen deleted", allergen, StatusCodes.OK);
        } catch (error) {
            return ServiceResponse.failure("Error deleting Allergen", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const allergenService = new AllergenService();