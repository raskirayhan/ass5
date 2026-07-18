import { Role } from "@prisma/client";
import { Request } from "express";

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ServiceFilters extends PaginationQuery {
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  location?: string;
}

export interface TechnicianFilters extends PaginationQuery {
  minRating?: string;
  maxPrice?: string;
  skill?: string;
  search?: string;
  location?: string;
}

export interface UserFilters extends PaginationQuery {
  role?: string;
  status?: string;
  search?: string;
}

export interface BookingFilters extends PaginationQuery {
  status?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export function parsePagination(query: PaginationQuery): PaginationParams {
  const page = Math.max(1, parseInt(query.page || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10) || 10));
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
  return { page, limit, skip, sortBy, sortOrder };
}
