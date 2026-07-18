import prisma from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../helpers";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.validation";
import { PaginationParams } from "../../interfaces";

const getAll = async (pagination: PaginationParams, search?: string) => {
  const where: any = { isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      include: { _count: { select: { services: true } } },
    }),
    prisma.category.count({ where }),
  ]);

  return { categories, total };
};

const getById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      services: {
        where: { isAvailable: true },
        include: {
          technician: { include: { user: { select: { id: true, name: true, email: true, profileImage: true } } } },
        },
      },
      _count: { select: { services: true } },
    },
  });
  if (!category) throw ApiError.notFound("Category not found");
  return category;
};

const create = async (dto: CreateCategoryInput) => {
  const existing = await prisma.category.findUnique({ where: { name: dto.name } });
  if (existing) throw ApiError.conflict("Category with this name already exists");

  const slug = slugify(dto.name);
  const existingSlug = await prisma.category.findUnique({ where: { slug } });
  if (existingSlug) throw ApiError.conflict("Category slug already exists");

  return prisma.category.create({
    data: { ...dto, slug },
  });
};

const update = async (id: string, dto: UpdateCategoryInput) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Category not found");

  if (dto.name && dto.name !== existing.name) {
    const nameTaken = await prisma.category.findUnique({ where: { name: dto.name } });
    if (nameTaken) throw ApiError.conflict("Category name already exists");
  }

  return prisma.category.update({ where: { id }, data: dto });
};

const toggleActive = async (id: string) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Category not found");

  return prisma.category.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });
};

const getAllAdmin = async (pagination: PaginationParams, search?: string) => {
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      include: { _count: { select: { services: true } } },
    }),
    prisma.category.count({ where }),
  ]);

  return { categories, total };
};

export const categoryService = { getAll, getById, create, update, toggleActive, getAllAdmin };
