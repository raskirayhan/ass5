import { z } from "zod";

export const createPaymentSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  provider: z.enum(["STRIPE", "SSLCOMMERZ"]).default("STRIPE"),
  simulate: z.boolean().optional(),
});

export const confirmPaymentSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  sessionId: z.string().min(1, "Session/Intent ID is required"),
  simulate: z.boolean().optional(),
});

export const webhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
