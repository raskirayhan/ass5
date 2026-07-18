import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { createServiceSchema, updateServiceSchema } from "./service.validation";
import { serviceController } from "./service.controller";

const router = Router();

router.get("/", serviceController.getAll);
router.get("/technician/:techId", serviceController.getByTechnician);
router.get("/:id", serviceController.getById);
router.post("/", authenticate, authorize("TECHNICIAN"), validate(createServiceSchema), serviceController.create);
router.put("/:id", authenticate, authorize("TECHNICIAN"), validate(updateServiceSchema), serviceController.update);
router.delete("/:id", authenticate, authorize("TECHNICIAN"), serviceController.remove);

export default router;
