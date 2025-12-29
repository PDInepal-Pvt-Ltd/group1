import { StatusCodes } from "http-status-codes";
import { SurplusRepository } from "./surplusRepository";
import type { CreateSurplusMark, DailySpecialResponse, SurplusMarkResponse } from "./surplusModel";
import { MenuItemRepository } from "../menuItem/menuItemRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import logger from "@/common/utils/logger";
import { SURPLUS_MARK_AUDIT_ACTIONS } from "@/common/constants/surplusAuditAction";
import { Prisma } from "@/generated/prisma/client";

export class SurplusService {
    private surplusRepository: SurplusRepository;
    private menuItemRepository: MenuItemRepository;
    private auditLogQueue = new AuditLogQueue();

    constructor(
        surplusRepository: SurplusRepository = new SurplusRepository(),
        menuItemRepository: MenuItemRepository = new MenuItemRepository()
    ) {
        this.surplusRepository = surplusRepository;
        this.menuItemRepository = menuItemRepository;
    }

    async createSurplus(data: CreateSurplusMark, markedBy: string): Promise<ServiceResponse<SurplusMarkResponse | null>> {
        try {
            const menuItem = await this.menuItemRepository.findById(data.menuItemId);
            if (!menuItem) {
                return ServiceResponse.failure("Menu item not found for surplus mark", null, StatusCodes.NOT_FOUND);
            }
            const isOverlapping = await this.surplusRepository.findOverlappingMark(
                data.menuItemId,
                data.surplusAt,
                data.surplusUntil
            );
            if (isOverlapping) {
                return ServiceResponse.failure(
                    "This item already has a surplus sale scheduled during this time period",
                    null,
                    StatusCodes.CONFLICT
                );
            }
            const surplus = await this.surplusRepository.createSurplusMark(data, markedBy);
            await this.auditLogQueue.add("createAuditLog", {
                userId: markedBy,
                action: SURPLUS_MARK_AUDIT_ACTIONS.CREATED,
                resourceType: "SurplusMark",
                resourceId: surplus.id,
                payload: surplus,
                ip: null,
                userAgent: null,
            });

            return ServiceResponse.success<SurplusMarkResponse>("Surplus mark created successfully", surplus, StatusCodes.CREATED);
        } catch (error) {
            logger.error("Error creating Surplus Mark:", error);
            return ServiceResponse.failure("Error creating Surplus Mark", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getDailySpecials(): Promise<ServiceResponse<SurplusMarkResponse[] | null>> {
        try {
            const activeMarks = await this.surplusRepository.findActiveSurplusMark();

            if (!activeMarks) {
                return ServiceResponse.failure("No active specials found", null, StatusCodes.NOT_FOUND);
            }

            return ServiceResponse.success<SurplusMarkResponse[]>("Daily specials fetched", activeMarks, StatusCodes.OK);
        } catch (error) {
            logger.error("Error fetching specials:", error);
            return ServiceResponse.failure("Internal Server Error", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getSurplusMarkById(surplusMarkId: string): Promise<ServiceResponse<SurplusMarkResponse | null>> {
        try {
            const surplusMark = await this.surplusRepository.findSurplusMarkById(surplusMarkId);
            if (!surplusMark) {
                return ServiceResponse.failure("Surplus mark not found", null, StatusCodes.NOT_FOUND);
            }
            return ServiceResponse.success<SurplusMarkResponse>("Surplus mark found successfully", surplusMark, StatusCodes.OK);
        } catch (error) {
            logger.error("Error getting surplus mark by id:", error);
            return ServiceResponse.failure("Error getting surplus mark by id", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async updateSurplusMark(surplusMarkId: string, data: CreateSurplusMark, markedBy: string): Promise<ServiceResponse<SurplusMarkResponse | null>> {
        try {
            const updatedSurplusMark = await this.surplusRepository.updateSurplusMark(surplusMarkId, data, markedBy);
            await this.auditLogQueue.add("createAuditLog", {
                userId: markedBy,
                action: SURPLUS_MARK_AUDIT_ACTIONS.UPDATED,
                resourceType: "SurplusMark",
                resourceId: surplusMarkId,
                payload: updatedSurplusMark,
                ip: null,
                userAgent: null,
            });
            return ServiceResponse.success<SurplusMarkResponse>("Surplus mark updated successfully", updatedSurplusMark, StatusCodes.OK);
        } catch (error) {
            logger.error("Error updating surplus mark:", error);
            return ServiceResponse.failure("Error updating surplus mark", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteSurplusMark(surplusMarkId: string, markedBy: string): Promise<ServiceResponse<SurplusMarkResponse | null>> {
        try {
            const deletedSurplusMark = await this.surplusRepository.deleteSurplusMark(surplusMarkId, markedBy);
            await this.auditLogQueue.add("createAuditLog", {
                userId: markedBy,
                action: SURPLUS_MARK_AUDIT_ACTIONS.DELETED,
                resourceType: "SurplusMark",
                resourceId: surplusMarkId,
                payload: deletedSurplusMark,
                ip: null,
                userAgent: null,
            });
            return ServiceResponse.success<SurplusMarkResponse>("Surplus mark deleted successfully", deletedSurplusMark, StatusCodes.OK);
        } catch (error) {
            logger.error("Error deleting surplus mark:", error);
            return ServiceResponse.failure("Error deleting surplus mark", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}
export const surplusService = new SurplusService();