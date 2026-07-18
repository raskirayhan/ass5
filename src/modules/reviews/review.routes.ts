import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { createReviewSchema } from "./review.validation";
import { reviewController } from "./review.controller";

const router = Router();

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review
 *     description: Leave a review for a completed booking. Customer only. One review per booking.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewInput'
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Review created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: You can only review completed bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (customer only) or not your booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: You have already reviewed this booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", authenticate, authorize("CUSTOMER"), validate(createReviewSchema), reviewController.create);

/**
 * @swagger
 * /api/reviews/technician/{techId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a technician
 *     description: Returns paginated reviews for a specific technician. Public endpoint.
 *     parameters:
 *       - in: path
 *         name: techId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Technician profile ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get("/technician/:techId", reviewController.getTechnicianReviews);

export default router;
