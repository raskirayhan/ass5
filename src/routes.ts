import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/categories/category.routes";
import serviceRoutes from "./modules/services/service.routes";
import technicianRoutes from "./modules/technicians/technician.routes";
import bookingRoutes from "./modules/bookings/booking.routes";
import paymentRoutes, { paymentWebhookRouter } from "./modules/payments/payment.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import adminRoutes from "./modules/admin/admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/services", serviceRoutes);
router.use("/technicians", technicianRoutes);
router.use("/technician", technicianRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);

export { paymentWebhookRouter };
export default router;
