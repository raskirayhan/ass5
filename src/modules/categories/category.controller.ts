import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { parsePagination } from "../../interfaces";
import { categoryService } from "./category.service";

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const search = req.query.search as string | undefined;
  const { categories, total } = await categoryService.getAll(pagination, search);
  res.status(200).json(
    ApiResponse.paginated(categories, pagination.page, pagination.limit, total)
  );
});

const getAllAdmin = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const search = req.query.search as string | undefined;
  const { categories, total } = await categoryService.getAllAdmin(pagination, search);
  res.status(200).json(
    ApiResponse.paginated(categories, pagination.page, pagination.limit, total)
  );
});

const getById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getById(String(req.params.id));
  res.status(200).json(ApiResponse.success(category));
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.create(req.body);
  res.status(201).json(ApiResponse.created(category, "Category created successfully"));
});

const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.update(String(req.params.id), req.body);
  res.status(200).json(ApiResponse.success(category, "Category updated successfully"));
});

const toggleActive = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.toggleActive(String(req.params.id));
  res.status(200).json(ApiResponse.success(category, "Category status toggled"));
});

export const categoryController = { getAll, getAllAdmin, getById, create, update, toggleActive };
