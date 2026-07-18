import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { parsePagination } from "../../interfaces";
import { bookingService } from "./booking.service";

const create = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.create(req.user!.userId, req.body);
  res.status(201).json(ApiResponse.created(booking, "Booking created successfully"));
});

const getCustomerBookings = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const status = req.query.status as string | undefined;
  const { bookings, total } = await bookingService.getCustomerBookings(req.user!.userId, pagination, status);
  res.status(200).json(
    ApiResponse.paginated(bookings, pagination.page, pagination.limit, total)
  );
});

const getById = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.getById(String(req.params.id), req.user!.userId, req.user!.role);
  res.status(200).json(ApiResponse.success(booking));
});

const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.cancelBooking(String(req.params.id), req.user!.userId);
  res.status(200).json(ApiResponse.success(booking, "Booking cancelled successfully"));
});

export const bookingController = { create, getCustomerBookings, getById, cancelBooking };
