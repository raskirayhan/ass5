import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { parsePagination } from "../../interfaces";
import { paymentService } from "./payment.service";

const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.createPayment(req.user!.userId, req.body);
  res.status(200).json(ApiResponse.success(result, "Payment initiated successfully"));
});

const confirmPayment = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, sessionId, simulate } = req.body;
  const result = await paymentService.confirmPayment(bookingId, sessionId, simulate);
  res.status(200).json(ApiResponse.success(result, "Payment confirmed successfully"));
});

const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  if (!sig) throw new Error("Missing stripe-signature header");

  const stripe = (await import("stripe")).default;
  const { config } = await import("../../config");
  const stripeClient = new stripe(config.stripeSecretKey, {
    apiVersion: "2024-12-18.acacia" as any,
  });

  let event: any;
  try {
    event = stripeClient.webhooks.constructEvent(
      (req as any).rawBody || JSON.stringify(req.body),
      sig,
      config.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).json({ error: "Webhook signature verification failed" });
    return;
  }

  await paymentService.handleStripeWebhook(event);
  res.status(200).json({ received: true });
});

const getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { payments, total } = await paymentService.getPaymentHistory(req.user!.userId, pagination);
  res.status(200).json(
    ApiResponse.paginated(payments, pagination.page, pagination.limit, total)
  );
});

const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.getPaymentById(String(req.params.id), req.user!.userId);
  res.status(200).json(ApiResponse.success(payment));
});

export const paymentController = {
  createPayment,
  confirmPayment,
  stripeWebhook,
  getPaymentHistory,
  getPaymentById,
};
