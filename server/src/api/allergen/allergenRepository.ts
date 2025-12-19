import { prisma } from "@/common/lib/prisma";
import { AllergenResponse, CreateAllergen, UpdateAllergen } from "./allergenModel";

export class AllergenRepository {
    async create(data: CreateAllergen): Promise<AllergenResponse> {
        return prisma.allergen.create({
            data,
        });
    }

    async findById(id: string): Promise<AllergenResponse | null> {
        return prisma.allergen.findUnique({
            where: { id },
        });
    }

    async findAll(): Promise<AllergenResponse[]> {
        return prisma.allergen.findMany();
    }

    async update(id: string, data: UpdateAllergen): Promise<AllergenResponse> {
        return prisma.allergen.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<AllergenResponse> {
        return prisma.allergen.delete({
            where: { id },
        });
    }
}