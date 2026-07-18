import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { createReviewSchema } from "./review.validation";
import { reviewController } from "./review.controller";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), validate(createReviewSchema), reviewController.create);
router.get("/technician/:techId", reviewController.getTechnicianReviews);

export default router;
