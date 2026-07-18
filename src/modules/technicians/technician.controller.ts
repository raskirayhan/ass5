import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { parsePagination } from "../../interfaces";
import { technicianService } from "./technician.service";

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const filters = {
    minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    skill: req.query.skill as string | undefined,
    search: req.query.search as string | undefined,
    location: req.query.location as string | undefined,
  };
  const { technicians, total } = await technicianService.getAll(pagination, filters);
  res.status(200).json(
    ApiResponse.paginated(technicians, pagination.page, pagination.limit, total)
  );
});

const getById = asyncHandler(async (req: Request, res: Response) => {
  const technician = await technicianService.getById(String(req.params.id));
  res.status(200).json(ApiResponse.success(technician));
});

const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await technicianService.getProfile(req.user!.userId);
  res.status(200).json(ApiResponse.success(profile));
});

const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await technicianService.updateProfile(req.user!.userId, req.body);
  res.status(200).json(ApiResponse.success(profile, "Profile updated successfully"));
});

const setAvailability = asyncHandler(async (req: Request, res: Response) => {
  const availability = await technicianService.setAvailability(req.user!.userId, req.body);
  res.status(200).json(ApiResponse.success(availability, "Availability updated successfully"));
});

const getAvailability = asyncHandler(async (req: Request, res: Response) => {
  const availability = await technicianService.getAvailability(req.user!.userId);
  res.status(200).json(ApiResponse.success(availability));
});

const getTechnicianBookings = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const status = req.query.status as string | undefined;
  const { bookings, total } = await technicianService.getTechnicianBookings(req.user!.userId, pagination, status);
  res.status(200).json(
    ApiResponse.paginated(bookings, pagination.page, pagination.limit, total)
  );
});

const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const booking = await technicianService.updateBookingStatus(req.user!.userId, String(req.params.bookingId), req.body.status);
  res.status(200).json(ApiResponse.success(booking, "Booking status updated successfully"));
});

export const technicianController = {
  getAll,
  getById,
  getProfile,
  updateProfile,
  setAvailability,
  getAvailability,
  getTechnicianBookings,
  updateBookingStatus,
};
