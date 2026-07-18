import { z } from "zod";

export const updateProfileSchema = z.object({
  bio: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  hourlyRate: z.number().positive().optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  serviceArea: z.string().optional(),
  profileImage: z.string().url().optional(),
});

export const setAvailabilitySchema = z.object({
  slots: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ).min(1, "At least one slot is required"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
