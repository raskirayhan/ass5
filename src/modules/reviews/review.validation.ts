import { z } from "zod";

export const createReviewSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
