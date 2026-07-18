import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { parsePagination } from "../../interfaces";
import { adminService } from "./admin.service";

const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const dashboard = await adminService.getDashboard();
  res.status(200).json(ApiResponse.success(dashboard));
});

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const filters = {
    role: req.query.role as string | undefined,
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
  };
  const { users, total } = await adminService.getAllUsers(pagination, filters);
  res.status(200).json(
    ApiResponse.paginated(users, pagination.page, pagination.limit, total)
  );
});

const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.toggleUserStatus(String(req.params.id));
  res.status(200).json(ApiResponse.success(user, "User status updated"));
});

const getAllBookings = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const filters = {
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
  };
  const { bookings, total } = await adminService.getAllBookings(pagination, filters);
  res.status(200).json(
    ApiResponse.paginated(bookings, pagination.page, pagination.limit, total)
  );
});

const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { categories, total } = await adminService.getAllCategories(pagination);
  res.status(200).json(
    ApiResponse.paginated(categories, pagination.page, pagination.limit, total)
  );
});

const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await adminService.createCategory(req.body);
  res.status(201).json(ApiResponse.created(category, "Category created successfully"));
});

const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await adminService.updateCategory(String(req.params.id), req.body);
  res.status(200).json(ApiResponse.success(category, "Category updated successfully"));
});

const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteCategory(String(req.params.id));
  res.status(200).json(ApiResponse.success(null, "Category deleted successfully"));
});

const getAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { reviews, total } = await adminService.getAllReviews(pagination);
  res.status(200).json(
    ApiResponse.paginated(reviews, pagination.page, pagination.limit, total)
  );
});

const getAllPayments = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const filters = { status: req.query.status as string | undefined };
  const { payments, total } = await adminService.getAllPayments(pagination, filters);
  res.status(200).json(
    ApiResponse.paginated(payments, pagination.page, pagination.limit, total)
  );
});

export const adminController = {
  getDashboard,
  getAllUsers,
  toggleUserStatus,
  getAllBookings,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllReviews,
  getAllPayments,
};
