import { StatusCodes } from "http-status-codes";
import { KdsEventRepository } from "./kdsEventRepository";
import { CreateKdsEvent, KdsEventResponse, KdsPerformance } from "./kdsEventModel";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import logger from "@/common/utils/logger";
import { KdsStateMachine } from "@/common/services/kdsStateMachineService";

export class KdsEventService {
    private auditLogQueue = new AuditLogQueue();
    private kdsEventRepository: KdsEventRepository;

    constructor(kdsEventRepository: KdsEventRepository = new KdsEventRepository()) {
        this.kdsEventRepository = kdsEventRepository;
    }

    async createEvent(data: CreateKdsEvent, actorId: string): Promise<ServiceResponse<KdsEventResponse | null>> {
        try {
            const event = await this.kdsEventRepository.create(data, actorId);

            await this.auditLogQueue.add("createAuditLog", {
                userId: actorId,
                action: "KDS_EVENT_CREATED",
                resourceType: "KdsEvent",
                resourceId: event.id,
                payload: event,
                ip: null,
                userAgent: null,
            });

            return ServiceResponse.success<KdsEventResponse>("KDS event logged", event, StatusCodes.CREATED);
        } catch (error) {
            logger.error("Error creating KDS event:", error);
            return ServiceResponse.failure("Error creating KDS event", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getEventsByOrder(orderId: string): Promise<ServiceResponse<KdsEventResponse[] | null>> {
        try {
            const events = await this.kdsEventRepository.findByOrderId(orderId);
            return ServiceResponse.success("Events retrieved", events, StatusCodes.OK);
        } catch (error) {
            logger.error("Error fetching KDS events:", error);
            return ServiceResponse.failure("Error fetching events", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async transitionStatus(data: CreateKdsEvent, actorId: string): Promise<ServiceResponse<KdsEventResponse | null>> {
        try {
            const lastEvent = await this.kdsEventRepository.getLatestEventForOrder(data.orderId);
            let minutesSpent = 0;

            const validation = KdsStateMachine.validateTransition(lastEvent?.status, data.status);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            if (lastEvent) {
                const diff = new Date().getTime() - new Date(lastEvent.timestamp).getTime();
                minutesSpent = Math.round(diff / 60000);
            }

            const event = await this.kdsEventRepository.create(data,actorId,minutesSpent);

            await this.auditLogQueue.add("createAuditLog", {
                userId: actorId,
                action: `KDS_STATUS_${data.status}`,
                resourceType: "KdsEvent",
                resourceId: event.id,
                payload: event,
                ip: null, userAgent: null,
            });

            return ServiceResponse.success("Status updated", event, StatusCodes.CREATED);
        } catch (error) {
            logger.error("KDS Transition Error:", error);
            return ServiceResponse.failure("Failed to update KDS status", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getPerformanceMetrics(days: number): Promise<ServiceResponse<KdsPerformance | null>> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const stats = await this.kdsEventRepository.getPerformanceStats(startDate, new Date());

            const totalCount = stats.reduce((acc, curr) => acc + curr._count.id, 0);
            const overallAvg = stats.reduce((acc, curr) => acc + (curr._avg.minutesSpent || 0), 0) / (stats.length || 1);

            const performance: KdsPerformance = {
                averagePrepTime: Math.round(overallAvg),
                totalCompleted: totalCount,
                longestPrepTime: Math.max(...stats.map(s => s._max.minutesSpent || 0)),
                efficiencyByActor: stats.map(s => ({
                    actorId: s.actorId || "System",
                    avgMinutes: Math.round(s._avg.minutesSpent || 0),
                    count: s._count.id
                }))
            };

            return ServiceResponse.success("Performance stats retrieved", performance, StatusCodes.OK);
        } catch (error) {
            logger.error("KDS Metrics Error:", error);
            return ServiceResponse.failure("Failed to fetch metrics", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getQueue(): Promise<ServiceResponse<any | null>> {
        try {
            const queue = await this.kdsEventRepository.getActiveKitchenQueue();
            return ServiceResponse.success("Kitchen queue retrieved", queue, StatusCodes.OK);
        } catch (error) {
            return ServiceResponse.failure("Error fetching queue", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getTimeline(orderId: string): Promise<ServiceResponse<any | null>> {
        try {
            const queue = await this.kdsEventRepository.getTimeline(orderId);
            return ServiceResponse.success("Order history retrieved", queue, StatusCodes.OK);
        } catch (error) {
            return ServiceResponse.failure("Error fetching order history", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const kdsEventService = new KdsEventService();