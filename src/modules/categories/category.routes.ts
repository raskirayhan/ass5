import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { createCategorySchema, updateCategorySchema } from "./category.validation";
import { categoryController } from "./category.controller";

const router = Router();

router.get("/", categoryController.getAll);
router.get("/admin", authenticate, authorize("ADMIN"), categoryController.getAllAdmin);
router.get("/:id", categoryController.getById);
router.post("/", authenticate, authorize("ADMIN"), validate(createCategorySchema), categoryController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validate(updateCategorySchema), categoryController.update);
router.patch("/:id/toggle-active", authenticate, authorize("ADMIN"), categoryController.toggleActive);

export default router;
