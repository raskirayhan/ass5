import prisma from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateReviewInput } from "./review.validation";
import { PaginationParams } from "../../interfaces";

const create = async (authorId: string, dto: CreateReviewInput) => {
  const booking = await prisma.booking.findUnique({
    where: { id: dto.bookingId },
    include: { review: true },
  });

  if (!booking) throw ApiError.notFound("Booking not found");
  if (booking.customerId !== authorId) throw ApiError.forbidden("Not your booking");
  if (booking.status !== "COMPLETED") {
    throw ApiError.badRequest("You can only review completed bookings");
  }
  if (booking.review) {
    throw ApiError.conflict("You have already reviewed this booking");
  }

  const review = await prisma.review.create({
    data: {
      authorId,
      bookingId: dto.bookingId,
      rating: dto.rating,
      comment: dto.comment,
    },
    include: {
      author: { select: { id: true, name: true, profileImage: true } },
      booking: {
        include: {
          service: { select: { title: true } },
          technician: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  const stats = await prisma.review.aggregate({
    where: {
      booking: { technicianId: booking.technicianId },
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const updateData: any = {
    avgRating: stats._avg.rating || 0,
  };
  updateData.totalReviews = stats._count.rating;

  await prisma.technicianProfile.update({
    where: { id: booking.technicianId },
    data: updateData,
  });

  return review;
};

const getTechnicianReviews = async (technicianId: string, pagination: PaginationParams) => {
  const where = { booking: { technicianId } };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, profileImage: true } },
        booking: {
          include: {
            service: { select: { id: true, title: true } },
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total };
};

export const reviewService = { create, getTechnicianReviews };
