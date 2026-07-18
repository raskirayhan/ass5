import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { parsePagination } from "../../interfaces";
import { serviceService } from "./service.service";

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const filters = {
    categoryId: req.query.categoryId as string | undefined,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    search: req.query.search as string | undefined,
    location: req.query.location as string | undefined,
  };
  const { services, total } = await serviceService.getAll(pagination, filters);
  res.status(200).json(
    ApiResponse.paginated(services, pagination.page, pagination.limit, total)
  );
});

const getById = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getById(String(req.params.id));
  res.status(200).json(ApiResponse.success(service));
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.create(req.user!.userId, req.body);
  res.status(201).json(ApiResponse.created(service, "Service created successfully"));
});

const update = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.update(req.user!.userId, String(req.params.id), req.body);
  res.status(200).json(ApiResponse.success(service, "Service updated successfully"));
});

const remove = asyncHandler(async (req: Request, res: Response) => {
  await serviceService.remove(req.user!.userId, String(req.params.id));
  res.status(200).json(ApiResponse.success(null, "Service deleted successfully"));
});

const getByTechnician = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { services, total } = await serviceService.getByTechnician(String(req.params.techId), pagination);
  res.status(200).json(
    ApiResponse.paginated(services, pagination.page, pagination.limit, total)
  );
});

export const serviceController = { getAll, getById, create, update, remove, getByTechnician };
