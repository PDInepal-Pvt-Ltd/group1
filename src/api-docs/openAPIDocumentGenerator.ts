import { userRegistry } from "@/api/user/userRouter";
import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { tableRegistry } from "@/api/table/tableRouter";
import { menuItemRegistry } from "@/api/menuItem/menuItemRouter";
import { categoryRegistry } from "@/api/category/categoryRouter";
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { reservationRegistry } from "@/api/reservation/reservationRouter";
import { allergenRegistry } from "@/api/allergen/allergenRouter";
import { menuItemAllergenRegistry } from "@/api/menuItemAllergen/menuItemAllergenRouter";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([healthCheckRegistry, userRegistry, tableRegistry, menuItemRegistry, reservationRegistry, categoryRegistry]);
	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Restaurant QRify API",
		},
		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},
	});
}