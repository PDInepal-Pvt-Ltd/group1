import { prisma } from "@/common/lib/prisma";
import type { DatabaseStatus } from "./healthCheckModel"; // Assuming DatabaseStatus is defined here

export class HealthCheckRepository {
  async checkDatabaseConnection(): Promise<DatabaseStatus> {
    const start = Date.now();

    const queryResult = await prisma.$queryRaw`SELECT 1`.catch(() => null);
    const duration = Date.now() - start;

    const result: DatabaseStatus = queryResult
      ? { status: "up", responseTime: `${duration}ms` }
      : { status: "down", error: "Database connection failed" };

    return result;
  }
}