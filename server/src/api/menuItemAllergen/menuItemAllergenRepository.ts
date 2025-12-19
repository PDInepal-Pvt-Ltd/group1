import { prisma } from "@/common/lib/prisma";
import { LinkAllergen, MenuItemAllergenResponse } from "./menuItemAllergenModel";

export class MenuItemAllergenRepository {
    async linkAllergens(data: LinkAllergen): Promise<MenuItemAllergenResponse[]> {
        await prisma.menuItemAllergen.createMany({
            data: data.allergenIds.map((id) => ({
                id,
                menuItemId: data.menuItemId,
                allergenId: id,
            })),
            skipDuplicates: true,
        });

        return prisma.menuItemAllergen.findMany({
            where: {
                menuItemId: data.menuItemId,
                allergenId: { in: data.allergenIds },
            },
            include: {
                allergen: true,
            },
        })
    }

    async findByMenuItem(menuItemId: string) {
        return prisma.menuItemAllergen.findMany({
            where: { menuItemId },
            include: { allergen: true },
        });
    }

    async unlinkAllergen(menuItemId: string, allergenId: string) {
        return prisma.menuItemAllergen.delete({
            where: {
                menuItemId_allergenId: {
                    menuItemId,
                    allergenId,
                },
            },
        });
    }
}