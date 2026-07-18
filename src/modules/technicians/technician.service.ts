import prisma from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { UpdateProfileInput, SetAvailabilityInput } from "./technician.validation";
import { PaginationParams } from "../../interfaces";

interface TechnicianFilters {
  minRating?: number;
  maxPrice?: number;
  skill?: string;
  search?: string;
  location?: string;
}

const getAll = async (pagination: PaginationParams, filters: TechnicianFilters) => {
  const where: any = { user: { status: "ACTIVE" } };

  if (filters.minRating) where.avgRating = { gte: filters.minRating };
  if (filters.maxPrice) where.hourlyRate = { lte: filters.maxPrice };
  if (filters.location) {
    where.OR = [
      { location: { contains: filters.location, mode: "insensitive" } },
      { serviceArea: { contains: filters.location, mode: "insensitive" } },
    ];
  }
  if (filters.skill) {
    where.skills = { has: filters.skill };
  }
  if (filters.search) {
    where.AND = [
      {
        OR: [
          { user: { name: { contains: filters.search, mode: "insensitive" } } },
          { bio: { contains: filters.search, mode: "insensitive" } },
          { skills: { has: filters.search } },
        ],
      },
    ];
  }

  const [technicians, total] = await Promise.all([
    prisma.technicianProfile.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sortBy === "avgRating" ? "avgRating" : pagination.sortBy]: pagination.sortOrder },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } },
        services: { where: { isAvailable: true } },
        _count: { select: { bookings: true } },
      },
    }),
    prisma.technicianProfile.count({ where }),
  ]);

  return { technicians, total };
};

const getById = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, profileImage: true, createdAt: true } },
      services: { where: { isAvailable: true }, include: { category: true } },
      availabilities: { where: { isAvailable: true } },
    },
  });
  if (!technician) throw ApiError.notFound("Technician not found");

  const reviews = await prisma.review.findMany({
    where: { booking: { technicianId: id } },
    include: {
      author: { select: { id: true, name: true, profileImage: true } },
      booking: { select: { id: true, service: { select: { title: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return { ...technician, reviews };
};

const getProfile = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
    include: {
      services: { include: { category: true } },
      availabilities: true,
      _count: { select: { bookings: true, services: true } },
    },
  });
  if (!profile) throw ApiError.notFound("Technician profile not found");
  return profile;
};

const updateProfile = async (userId: string, dto: UpdateProfileInput) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound("Technician profile not found");

  return prisma.technicianProfile.update({
    where: { userId },
    data: dto,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
};

const setAvailability = async (userId: string, dto: SetAvailabilityInput) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound("Technician profile not found");

  await prisma.availability.deleteMany({ where: { techId: profile.id } });
  const created = await prisma.availability.createMany({
    data: dto.slots.map((slot) => ({
      techId: profile.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
    })),
  });

  const availabilities = await prisma.availability.findMany({
    where: { techId: profile.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return availabilities;
};

const getAvailability = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound("Technician profile not found");

  return prisma.availability.findMany({
    where: { techId: profile.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
};

const getTechnicianBookings = async (userId: string, pagination: PaginationParams, status?: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound("Technician profile not found");

  const where: any = { technicianId: profile.id };
  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        service: true,
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total };
};

const updateBookingStatus = async (userId: string, bookingId: string, newStatus: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound("Technician profile not found");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw ApiError.notFound("Booking not found");
  if (booking.technicianId !== profile.id) throw ApiError.forbidden("Not your booking");

  const { canTransitionStatus } = await import("../../helpers");
  if (!canTransitionStatus(booking.status, newStatus as any)) {
    throw ApiError.badRequest(`Cannot transition from ${booking.status} to ${newStatus}`);
  }

  const data: any = { status: newStatus };
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

export const technicianService = {
  getAll,
  getById,
  getProfile,
  updateProfile,
  setAvailability,
  getAvailability,
  getTechnicianBookings,
  updateBookingStatus,
};
