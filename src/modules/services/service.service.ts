import prisma from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateServiceInput, UpdateServiceInput } from "./service.validation";
import { PaginationParams } from "../../interfaces";

interface ServiceFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  location?: string;
}

const getAll = async (pagination: PaginationParams, filters: ServiceFilters) => {
  const where: any = { isAvailable: true };

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }
  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      include: {
        category: true,
        technician: {
          include: {
            user: { select: { id: true, name: true, email: true, profileImage: true } },
          },
        },
      },
    }),
    prisma.service.count({ where }),
  ]);

  return { services, total };
};

const getById = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      category: true,
      technician: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } },
        },
      },
    },
  });
  if (!service) throw ApiError.notFound("Service not found");

  const reviews = await prisma.review.findMany({
    where: { booking: { technicianId: service.techId } },
    include: {
      author: { select: { id: true, name: true, profileImage: true } },
      booking: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return { ...service, reviews };
};

const create = async (userId: string, dto: CreateServiceInput) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
  if (!technicianProfile) throw ApiError.badRequest("Technician profile not found");

  const category = await prisma.category.findUnique({
    where: { id: dto.categoryId },
  });
  if (!category) throw ApiError.badRequest("Category not found");

  return prisma.service.create({
    data: { ...dto, techId: technicianProfile.id },
    include: { category: true },
  });
};

const update = async (userId: string, serviceId: string, dto: UpdateServiceInput) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
  if (!technicianProfile) throw ApiError.badRequest("Technician profile not found");

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw ApiError.notFound("Service not found");
  if (service.techId !== technicianProfile.id) throw ApiError.forbidden("Not your service");

  if (dto.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw ApiError.badRequest("Category not found");
  }

  return prisma.service.update({
    where: { id: serviceId },
    data: dto,
    include: { category: true },
  });
};

const remove = async (userId: string, serviceId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
  if (!technicianProfile) throw ApiError.badRequest("Technician profile not found");

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw ApiError.notFound("Service not found");
  if (service.techId !== technicianProfile.id) throw ApiError.forbidden("Not your service");

  await prisma.service.delete({ where: { id: serviceId } });
};

const getByTechnician = async (techId: string, pagination: PaginationParams) => {
  const where = { techId };
  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.service.count({ where }),
  ]);
  return { services, total };
};

export const serviceService = { getAll, getById, create, update, remove, getByTechnician };
