import { RequestHandler } from "express";
import { handleServiceResponse } from "@/common/utils/serviceResponse";
import { CreateCategorySchema } from "./categoryModel";
import { categoryService } from "./categoryService";

class CategoryController {
  public createCategory: RequestHandler = async (req, res) => {
    const userId = req.user!.id;
    const data = CreateCategorySchema.parse(req.body);

    const imagePath = req.file?.path; 

    const response = await categoryService.create(
      data,
      userId,
      imagePath
    );

    return handleServiceResponse(response, res);
  };

  public getAllCategories: RequestHandler = async (_req, res) => {
    return handleServiceResponse(
      await categoryService.getAll(),
      res
    );
  };

  public getCategoryById: RequestHandler = async (req, res) => {
    return handleServiceResponse(
      await categoryService.getById(req.params.id),
      res
    );
  };

  public updateCategory: RequestHandler = async (req, res) => {
    return handleServiceResponse(
      await categoryService.update(
        req.params.id,
        req.body,
        req.user!.id
      ),
      res
    );
  };

  public deleteCategory: RequestHandler = async (req, res) => {
    return handleServiceResponse(
      await categoryService.delete(
        req.params.id,
        req.user!.id
      ),
      res
    );
  };
}

export const categoryController = new CategoryController();
