import { BookingStatus } from "@prisma/client";
import prisma from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateBookingInput } from "./booking.validation";
import { PaginationParams } from "../../interfaces";
import { canTransitionStatus } from "../../helpers";

const create = async (customerId: string, dto: CreateBookingInput) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { id: dto.technicianId },
  });
  if (!technicianProfile) throw ApiError.badRequest("Technician not found");

  const service = await prisma.service.findUnique({
    where: { id: dto.serviceId },
  });
  if (!service) throw ApiError.badRequest("Service not found");
  if (service.techId !== dto.technicianId) throw ApiError.badRequest("Service does not belong to this technician");
  if (!service.isAvailable) throw ApiError.badRequest("Service is not available");

  const existingBooking = await prisma.booking.findFirst({
    where: {
      technicianId: dto.technicianId,
      date: dto.date as Date,
      time: dto.time,
      status: { notIn: ["DECLINED", "CANCELLED"] },
    },
  });
  if (existingBooking) throw ApiError.conflict("Technician is already booked for this slot");

  const booking = await prisma.booking.create({
    data: {
      customerId,
      technicianId: dto.technicianId,
      serviceId: dto.serviceId,
      date: dto.date as Date,
      time: dto.time,
      address: dto.address,
      note: dto.note,
    },
    include: {
      service: true,
      technician: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  return booking;
};

const getCustomerBookings = async (customerId: string, pagination: PaginationParams, status?: string) => {
  const where: any = { customerId };
  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: {
        service: { include: { category: true } },
        technician: {
          include: { user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } } },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total };
};

const getById = async (bookingId: string, userId: string, role: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { include: { category: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      technician: {
        include: { user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } } },
      },
      payment: true,
      review: true,
    },
  });

  if (!booking) throw ApiError.notFound("Booking not found");

  if (role === "CUSTOMER" && booking.customerId !== userId) {
    throw ApiError.forbidden("Not your booking");
  }
  if (role === "TECHNICIAN") {
    const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (!profile || profile.id !== booking.technicianId) {
      throw ApiError.forbidden("Not your booking");
    }
  }

  return booking;
};

const cancelBooking = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw ApiError.notFound("Booking not found");
  if (booking.customerId !== userId) throw ApiError.forbidden("Not your booking");

  if (!canTransitionStatus(booking.status, "CANCELLED" as BookingStatus)) {
    throw ApiError.badRequest(`Cannot cancel booking in ${booking.status} status`);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
    include: {
      service: true,
      technician: { include: { user: { select: { id: true, name: true } } } },
    },
  });
};

const updateStatus = async (bookingId: string, userId: string, newStatus: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw ApiError.notFound("Booking not found");

  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile || profile.id !== booking.technicianId) {
    throw ApiError.forbidden("Not your booking");
  }

  if (!canTransitionStatus(booking.status, newStatus as BookingStatus)) {
    throw ApiError.badRequest(`Cannot transition from ${booking.status} to ${newStatus}`);
  }

  const data: any = { status: newStatus as BookingStatus };
  if (newStatus === "COMPLETED") {
    await prisma.technicianProfile.update({
      where: { id: profile.id },
      data: { completedJobs: { increment: 1 } },
    });
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data,
    include: {
      service: true,
      customer: { select: { id: true, name: true, email: true } },
    },
  });
};

export const bookingService = { create, getCustomerBookings, getById, cancelBooking, updateStatus };
