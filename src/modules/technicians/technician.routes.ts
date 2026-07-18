import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { updateProfileSchema, setAvailabilitySchema } from "./technician.validation";
import { technicianController } from "./technician.controller";

const router = Router();

router.get("/", technicianController.getAll);
router.get("/bookings", authenticate, authorize("TECHNICIAN"), technicianController.getTechnicianBookings);
router.get("/availability/me", authenticate, authorize("TECHNICIAN"), technicianController.getAvailability);
router.put("/profile", authenticate, authorize("TECHNICIAN"), validate(updateProfileSchema), technicianController.updateProfile);
router.put("/availability", authenticate, authorize("TECHNICIAN"), validate(setAvailabilitySchema), technicianController.setAvailability);
router.get("/me", authenticate, authorize("TECHNICIAN"), technicianController.getProfile);
router.get("/:id", technicianController.getById);

export default router;
