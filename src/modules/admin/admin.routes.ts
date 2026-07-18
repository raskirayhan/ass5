import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { createCategorySchema, updateCategorySchema } from "./admin.validation";
import { adminController } from "./admin.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", adminController.getDashboard);
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/status", adminController.toggleUserStatus);
router.get("/bookings", adminController.getAllBookings);
router.get("/categories", adminController.getAllCategories);
router.post("/categories", validate(createCategorySchema), adminController.createCategory);
router.put("/categories/:id", validate(updateCategorySchema), adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);
router.get("/reviews", adminController.getAllReviews);
router.get("/payments", adminController.getAllPayments);

export default router;
