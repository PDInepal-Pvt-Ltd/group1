import process from "node:process";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import logger from "@/common/utils/logger";
import { StatusCodes } from "http-status-codes";
import { HealthCheckRepository } from "./healthCheckRepository";
import { type HealthCheckResponse, HealthCheckResponseSchema } from "./healthCheckModel";

export class HealthCheckService {
    private healthCheckRepository: HealthCheckRepository;

    constructor(repository: HealthCheckRepository = new HealthCheckRepository()) {
        this.healthCheckRepository = repository;
    }

    async healthCheck(): Promise<ServiceResponse<HealthCheckResponse | null>> {
        try {
            // Fetch database connection status
            const isDatabaseConnected = await this.healthCheckRepository.checkDatabaseConnection();

            // Fetch system metrics (memory, CPU, etc.)
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            const memoryLimit = 80 * 1024 * 1024; // Example: 80 MB limit
            const cpuLimit = 80; // Example: 80% CPU limit

            const memoryStatus: "high" | "normal" = memoryUsage.heapUsed > memoryLimit ? "high" : "normal";
            const cpuStatus: "high" | "normal" = cpuUsage.system > cpuLimit ? "high" : "normal";


            // Prepare health check response object
            const healthCheck: HealthCheckResponse = {
                uptime: process.uptime(),
                message: "OK",
                timestamp: Date.now(),
                system: {
                    memoryStatus,
                    cpuStatus,
                    memoryUsage,
                    cpuUsage,
                },
                checks: {
                    database: isDatabaseConnected,
                },
            };

            // Validate the response object with Zod schema
            HealthCheckResponseSchema.parse(healthCheck);

            // Return success response with the validated health check
            return ServiceResponse.success("Service is healthy", healthCheck, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Health check failed: ${(ex as Error).message}`;
            logger.error(errorMessage);

            // Return failure response
            return ServiceResponse.failure("Health check failed", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const healthCheckService = new HealthCheckService();