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
            console.log(data.status)
console.log(lastEvent?.status)
            const validation = KdsStateMachine.validateTransition(lastEvent?.status, data.status);
            console.log(validation)
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

        // Calculate totals for weighted average
        let totalCompleted = 0;
        let totalMinutesSum = 0;
        let absoluteMax = 0;

        const efficiencyByActor = stats.map(s => {
            const count = s._count.id;
            const avg = Number(s._avg.minutesSpent) || 0;
            const max = Number(s._max.minutesSpent) || 0;

            totalCompleted += count;
            totalMinutesSum += (avg * count); // Weighted sum
            if (max > absoluteMax) absoluteMax = max;

            return {
                actorId: s.actorId || "System",
                avgMinutes: Math.round(avg),
                count: count
            };
        });

        const overallAvg = totalCompleted > 0 ? (totalMinutesSum / totalCompleted) : 0;

        const performance: KdsPerformance = {
            averagePrepTime: Math.round(overallAvg),
            totalCompleted: totalCompleted,
            longestPrepTime: absoluteMax,
            efficiencyByActor: efficiencyByActor
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