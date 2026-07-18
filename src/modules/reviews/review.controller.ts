import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { parsePagination } from "../../interfaces";
import { reviewService } from "./review.service";

const create = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.create(req.user!.userId, req.body);
  res.status(201).json(ApiResponse.created(review, "Review created successfully"));
});

const getTechnicianReviews = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { reviews, total } = await reviewService.getTechnicianReviews(String(req.params.techId), pagination);
  res.status(200).json(
    ApiResponse.paginated(reviews, pagination.page, pagination.limit, total)
  );
});

export const reviewController = { create, getTechnicianReviews };
