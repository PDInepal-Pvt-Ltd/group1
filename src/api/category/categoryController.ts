import { RequestHandler } from "express";
import { categoryService } from "./categoryService";
import { CreateCategorySchema, UpdateCategorySchema } from "./categoryModel";
import { handleServiceResponse } from "@/common/utils/serviceResponse";

class CategoryController {
  create: RequestHandler = async (req, res) => {
    const data = CreateCategorySchema.parse(req.body);
    handleServiceResponse(
      await categoryService.create(data, req.user!.id),
      res
    );
  };

  getAll: RequestHandler = async (_req, res) => {
    handleServiceResponse(await categoryService.getAll(), res);
  };

  getById: RequestHandler = async (req, res) => {
    handleServiceResponse(await categoryService.getById(req.params.id), res);
  };

  update: RequestHandler = async (req, res) => {
    const data = UpdateCategorySchema.parse(req.body);
    handleServiceResponse(
      await categoryService.update(req.params.id, data, req.user!.id),
      res
    );
  };

  delete: RequestHandler = async (req, res) => {
    handleServiceResponse(
      await categoryService.delete(req.params.id, req.user!.id),
      res
    );
  };
}

export const categoryController = new CategoryController();
