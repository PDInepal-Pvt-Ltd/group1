import { userRegistry } from "@/api/user/userRouter";
import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { tableRegistry } from "@/api/table/tableRouter";
import { menuItemRegistry } from "@/api/menuItem/menuItemRouter";
import { categoryRegistry } from "@/api/category/categoryRouter";
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { reservationRegistry } from "@/api/reservation/reservationRouter";
import { allergenRegistry } from "@/api/allergen/allergenRouter";
import { menuItemAllergenRegistry } from "@/api/menuItemAllergen/menuItemAllergenRouter";
import { orderRegistry } from "@/api/order/orderRouter";
import { billRegistry } from "@/api/bill/billRouter";
import { surplusRegistry } from "@/api/surplus/surplusRouter";
import { auditLogRegistry } from "@/api/auditlog/auditlogRouter";
import { kdsEventRegistry } from "@/api/kds/kdsEventRouter";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([
		healthCheckRegistry,
		userRegistry,
		tableRegistry,
		menuItemRegistry,
		categoryRegistry,
		reservationRegistry,
		allergenRegistry,
		menuItemAllergenRegistry,
		orderRegistry,
		billRegistry,
		surplusRegistry,
		kdsEventRegistry,
		auditLogRegistry
	]);
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