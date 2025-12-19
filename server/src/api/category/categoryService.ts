import { StatusCodes } from "http-status-codes";
import { CategoryRepository } from "./categoryRepository";
import { CreateCategory, CategoryResponse } from "./categoryModel";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import logger from "@/common/utils/logger";
import { uploadOnCloudinary } from "@/common/lib/cloudinary";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import { CATEGORY_AUDIT_ACTIONS } from "@/common/constants/categoryAuditActions";

export class CategoryService {
  private repo = new CategoryRepository();
  private auditQueue = new AuditLogQueue();

  async create(
    data: CreateCategory,
    userId: string,
    imagePath?: string
  ): Promise<ServiceResponse<CategoryResponse | null>> {
    try {
      let imageUrl: string | null = null;

      if (imagePath) {
        const uploaded = await uploadOnCloudinary(imagePath);
        imageUrl = uploaded?.secure_url ?? null;
      }

      const category = await this.repo.create({
        name: data.name,
        imageUrl,
      });

      await this.auditQueue.add("createAuditLog", {
        userId,
        action: CATEGORY_AUDIT_ACTIONS.CATEGORY_CREATED,
        resourceType: "Category",
        resourceId: category.id,
        payload: category,
      });

      return ServiceResponse.success(
        "Category created successfully",
        category,
        StatusCodes.CREATED
      );
    } catch (error: any) {
      logger.error(error);

      if (error.code === "P2002") {
        return ServiceResponse.failure(
          "Category already exists",
          null,
          StatusCodes.CONFLICT
        );
      }

      return ServiceResponse.failure(
        "Failed to create category",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAll() {
    return ServiceResponse.success(
      "Categories fetched",
      await this.repo.findAll(),
      StatusCodes.OK
    );
  }

  async getById(id: string) {
    const category = await this.repo.findById(id);
    if (!category)
      return ServiceResponse.failure(
        "Category not found",
        null,
        StatusCodes.NOT_FOUND
      );

    return ServiceResponse.success(
      "Category fetched",
      category,
      StatusCodes.OK
    );
  }

  async update(id: string, data: any, userId: string) {
    const updated = await this.repo.update(id, data);

    await this.auditQueue.add("createAuditLog", {
      userId,
      action: CATEGORY_AUDIT_ACTIONS.CATEGORY_UPDATED,
      resourceType: "Category",
      resourceId: id,
      payload: updated,
    });

    return ServiceResponse.success(
      "Category updated",
      updated,
      StatusCodes.OK
    );
  }

  async delete(id: string, userId: string) {
    await this.repo.softDelete(id);

    await this.auditQueue.add("createAuditLog", {
      userId,
      action: CATEGORY_AUDIT_ACTIONS.CATEGORY_DELETED,
      resourceType: "Category",
      resourceId: id,
      payload: null,
    });

    return ServiceResponse.success(
      "Category deleted",
      null,
      StatusCodes.OK
    );
  }
}

export const categoryService = new CategoryService();
