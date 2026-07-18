import prisma from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { PaginationParams } from "../../interfaces";
import { slugify } from "../../helpers";

interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

interface BookingFilters {
  status?: string;
  search?: string;
}

const getDashboard = async () => {
  const [
    totalUsers,
    totalTechnicians,
    totalCustomers,
    totalBookings,
    totalRevenue,
    totalServices,
    totalCategories,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "TECHNICIAN" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.booking.count(),
    prisma.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    prisma.service.count(),
    prisma.category.count(),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        technician: { include: { user: { select: { id: true, name: true } } } },
        service: { select: { title: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    totalTechnicians,
    totalCustomers,
    totalBookings,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalServices,
    totalCategories,
    recentBookings,
  };
};

const getAllUsers = async (pagination: PaginationParams, filters: UserFilters) => {
  const where: any = {};

  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        technicianProfile: { select: { id: true, avgRating: true } },
        _count: { select: { bookingsAsCustomer: true, payments: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

const toggleUserStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  const newStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";

  return prisma.user.update({
    where: { id: userId },
    data: { status: newStatus as any },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
};

const getAllBookings = async (pagination: PaginationParams, filters: BookingFilters) => {
  const where: any = {};

  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { customer: { name: { contains: filters.search, mode: "insensitive" } } },
      { customer: { email: { contains: filters.search, mode: "insensitive" } } },
      { service: { title: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        technician: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        service: true,
        payment: true,
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total };
};

const getAllCategories = async (pagination: PaginationParams) => {
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { services: true } } },
    }),
    prisma.category.count(),
  ]);

  return { categories, total };
};

const createCategory = async (dto: { name: string; description?: string; icon?: string }) => {
  const existing = await prisma.category.findUnique({ where: { name: dto.name } });
  if (existing) throw ApiError.conflict("Category name already exists");

  const slug = slugify(dto.name);
  return prisma.category.create({ data: { ...dto, slug } });
};

const updateCategory = async (id: string, dto: { name?: string; description?: string; icon?: string; isActive?: boolean }) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Category not found");

  return prisma.category.update({ where: { id }, data: dto });
};

const deleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Category not found");

  const serviceCount = await prisma.service.count({ where: { categoryId: id } });
  if (serviceCount > 0) {
    throw ApiError.badRequest("Cannot delete category with existing services");
  }

  await prisma.category.delete({ where: { id } });
};

const getAllReviews = async (pagination: PaginationParams) => {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
        booking: {
          include: {
            service: { select: { id: true, title: true } },
            technician: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
    }),
    prisma.review.count(),
  ]);

  return { reviews, total };
};

const getAllPayments = async (pagination: PaginationParams, filters: { status?: string }) => {
  const where: any = {};
  if (filters.status) where.status = filters.status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
            service: { select: { id: true, title: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, total };
};

export const adminService = {
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
