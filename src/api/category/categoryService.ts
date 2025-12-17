import { StatusCodes } from "http-status-codes";
import { CategoryRepository } from "./categoryRepository";
import { CreateCategory, UpdateCategory, CategoryResponse } from "./categoryModel";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import logger from "@/common/utils/logger";
import { AuditLogQueue } from "@/queues/instances/auditlogQueue";
import { CATEGORY_AUDIT_ACTIONS } from "@/common/constants/categoryAuditActions";

export class CategoryService {
  private repo = new CategoryRepository();
  private auditQueue = new AuditLogQueue();

  async create(data: CreateCategory, userId: string) {
    try {
      const category = await this.repo.create(data);

      await this.auditQueue.add("createAuditLog", {
        userId,
        action: CATEGORY_AUDIT_ACTIONS.CATEGORY_CREATED,
        resourceType: "Category",
        resourceId: category.id,
        payload: category,
      });

      return ServiceResponse.success<CategoryResponse>(
        "Category created successfully",
        category,
        StatusCodes.CREATED
      );
    } catch (error: any) {
      logger.error(error);

      if (error.code === "P2002") {
        return ServiceResponse.failure(
          "Category with this name already exists",
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
    try {
      const categories = await this.repo.findAll();

      return ServiceResponse.success<CategoryResponse[]>(
        "Categories fetched successfully",
        categories,
        StatusCodes.OK
      );
    } catch (error) {
      logger.error(error);
      return ServiceResponse.failure(
        "Failed to fetch categories",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getById(id: string) {
    try {
      const category = await this.repo.findById(id);

      if (!category) {
        return ServiceResponse.failure(
          "Category not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return ServiceResponse.success<CategoryResponse>(
        "Category fetched successfully",
        category,
        StatusCodes.OK
      );
    } catch (error) {
      logger.error(error);
      return ServiceResponse.failure(
        "Failed to fetch category",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: string, data: UpdateCategory, userId: string) {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        return ServiceResponse.failure(
          "Category not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const updated = await this.repo.update(id, data);

      await this.auditQueue.add("createAuditLog", {
        userId,
        action: CATEGORY_AUDIT_ACTIONS.CATEGORY_UPDATED,
        resourceType: "Category",
        resourceId: id,
        payload: updated,
      });

      return ServiceResponse.success<CategoryResponse>(
        "Category updated successfully",
        updated,
        StatusCodes.OK
      );
    } catch (error) {
      logger.error(error);
      return ServiceResponse.failure(
        "Failed to update category",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async delete(id: string, userId: string) {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        return ServiceResponse.failure(
          "Category not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      await this.repo.softDelete(id);

      await this.auditQueue.add("createAuditLog", {
        userId,
        action: CATEGORY_AUDIT_ACTIONS.CATEGORY_DELETED,
        resourceType: "Category",
        resourceId: id,
        payload: null,
      });

      return ServiceResponse.success(
        "Category deleted successfully",
        null,
        StatusCodes.OK
      );
    } catch (error) {
      logger.error(error);
      return ServiceResponse.failure(
        "Failed to delete category",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const categoryService = new CategoryService();
