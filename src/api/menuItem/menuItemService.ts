import { StatusCodes } from "http-status-codes";
import type { MenuItemResponse, CreateMenuItem } from "./menuItemModel";
import { MenuItemRepository } from "./menuItemRepository";
import { uploadOnCloudinary } from "@/common/lib/cloudinary";
// import { CategoryRepository } from "../category/categoryRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import { MENU_ITEM_AUDIT_ACTIONS } from "@/common/constants/menuItemAuditActions";
import logger from "@/common/utils/logger";

export class MenuItemService {
    private auditLogQueue = new AuditLogQueue();
    private menuItemRepository: MenuItemRepository;
    // private categoryRepository: CategoryRepository;

    constructor(
        menuItemRepository: MenuItemRepository = new MenuItemRepository(),
        // categoryRepository: CategoryRepository = new CategoryRepository()
    ) {
        this.menuItemRepository = menuItemRepository;
        // this.categoryRepository = categoryRepository;
    }

    async createMenuItem(data: CreateMenuItem, menuImage: Express.Multer.File, userId: string): Promise<ServiceResponse<MenuItemResponse | null>> {
        try {
            // if(data.categoryId){
            //     const category = await this.categoryRepository.findById(data.categoryId);
            //     if(!category){
            //         return ServiceResponse.failure(`Category ${data.categoryId} does not exist`, null, StatusCodes.BAD_REQUEST);
            //     }
            // }
            const uploadMenuImageResult = await uploadOnCloudinary(menuImage.path);
            if (!uploadMenuImageResult) {
                return ServiceResponse.failure("Failed to upload menu image", null, StatusCodes.INTERNAL_SERVER_ERROR);
            }
            const imageUrl = uploadMenuImageResult.secure_url;
            const menuItem = await this.menuItemRepository.createMenuItem(data, imageUrl);
            await this.auditLogQueue.add("createAuditLog", {
                userId,
                action: MENU_ITEM_AUDIT_ACTIONS.CREATED,
                resourceType: "MenuItem",
                resourceId: menuItem.id,
                payload: menuItem,
                ip: null,
                userAgent: null,
            });
            return ServiceResponse.success<MenuItemResponse>("Menu item created successfully", menuItem, StatusCodes.CREATED);
        } catch (error) {
            logger.error("Error creating Menu Item:", error);
            return ServiceResponse.failure("Error creating Menu Item", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getMenuItemById(menuItemId: string): Promise<ServiceResponse<MenuItemResponse | null>> {
        try {
            const menuItem = await this.menuItemRepository.findById(menuItemId);
            if (!menuItem) {
                return ServiceResponse.failure("Menu item not found", null, StatusCodes.NOT_FOUND);
            }
            return ServiceResponse.success<MenuItemResponse>("Menu item found successfully", menuItem, StatusCodes.OK);
        } catch (error) {
            logger.error("Error getting menu item by id:", error);
            return ServiceResponse.failure("Error getting menu item by id", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const menuItemService = new MenuItemService();