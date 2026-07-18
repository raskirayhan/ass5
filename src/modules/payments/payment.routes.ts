import { Router, raw } from "express";
import { authenticate } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { createPaymentSchema, confirmPaymentSchema } from "./payment.validation";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/create", authenticate, validate(createPaymentSchema), paymentController.createPayment);
router.post("/confirm", authenticate, validate(confirmPaymentSchema), paymentController.confirmPayment);
router.get("/", authenticate, paymentController.getPaymentHistory);
router.get("/:id", authenticate, paymentController.getPaymentById);

export const paymentWebhookRouter = Router();
paymentWebhookRouter.post(
  "/webhook",
  raw({ type: "application/json" }),
  paymentController.stripeWebhook
);

export default router;
