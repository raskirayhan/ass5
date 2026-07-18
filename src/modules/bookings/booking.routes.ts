import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { createBookingSchema } from "./booking.validation";
import { bookingController } from "./booking.controller";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), validate(createBookingSchema), bookingController.create);
router.get("/", authenticate, bookingController.getCustomerBookings);
router.get("/:id", authenticate, bookingController.getById);
router.patch("/:id/cancel", authenticate, authorize("CUSTOMER"), bookingController.cancelBooking);

export default router;
