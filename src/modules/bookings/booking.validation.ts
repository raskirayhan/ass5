import { z } from "zod";

export const createBookingSchema = z.object({
  technicianId: z.string().uuid("Invalid technician ID"),
  serviceId: z.string().uuid("Invalid service ID"),
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  time: z.string().min(1, "Time slot is required"),
  address: z.string().min(1, "Address is required"),
  note: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
