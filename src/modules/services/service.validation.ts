import { z } from "zod";

export const createServiceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  duration: z.number().int().positive("Duration must be a positive integer (minutes)"),
  location: z.string().optional(),
  categoryId: z.string().uuid("Invalid category ID"),
});

export const updateServiceSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  location: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  isAvailable: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
