import { z } from "zod";

export const SystemMetricsSchema = z.object({
  memoryStatus: z.enum(["high", "normal"]),
  cpuStatus: z.enum(["high", "normal"]),
  memoryUsage: z.object({
    heapUsed: z.number(),
    heapTotal: z.number(),
    rss: z.number(),
  }),
  cpuUsage: z.object({
    user: z.number(),
    system: z.number(),
  }),
});

export const DatabaseStatusSchema = z.object({
  status: z.enum(["up", "down"]),
  responseTime: z.string().optional(),
  error: z.string().optional(),
});

export const HealthCheckResponseSchema = z.object({
  uptime: z.number(),
  message: z.string(),
  timestamp: z.number(),
  system: SystemMetricsSchema,
  checks: z.object({
    database: DatabaseStatusSchema,
  }),
});

export type systemMetrics = z.infer<typeof SystemMetricsSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
export type DatabaseStatus = z.infer<typeof DatabaseStatusSchema>;