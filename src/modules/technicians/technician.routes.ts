import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { updateProfileSchema, setAvailabilitySchema } from "./technician.validation";
import { technicianController } from "./technician.controller";

const router = Router();

/**
 * @swagger
 * /api/technicians:
 *   get:
 *     tags: [Technicians]
 *     summary: List all technicians
 *     description: Returns a paginated list of verified technicians with optional filters. Public endpoint.
 *     parameters:
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
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum rating filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum hourly rate filter
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *         description: Filter by skill
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, bio, or skills
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location or service area
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Technicians retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get("/", technicianController.getAll);

/**
 * @swagger
 * /api/technician/bookings:
 *   get:
 *     tags: [Technicians]
 *     summary: Get technician's bookings
 *     description: Returns the authenticated technician's bookings with optional status filter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [REQUESTED, ACCEPTED, DECLINED, PAID, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (technician only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/bookings", authenticate, authorize("TECHNICIAN"), technicianController.getTechnicianBookings);

/**
 * @swagger
 * /api/technician/bookings/{bookingId}:
 *   patch:
 *     tags: [Technicians]
 *     summary: Update booking status
 *     description: Accept, decline, or complete a booking. Technician only. Must follow status transition rules.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED]
 *                 description: New booking status
 *     responses:
 *       200:
 *         description: Booking status updated successfully
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
 *                   example: Booking status updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid status transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not your booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/bookings/:bookingId", authenticate, authorize("TECHNICIAN"), technicianController.updateBookingStatus);

/**
 * @swagger
 * /api/technician/availability/me:
 *   get:
 *     tags: [Technicians]
 *     summary: Get my availability
 *     description: Returns the authenticated technician's availability slots.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Availability'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (technician only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/availability/me", authenticate, authorize("TECHNICIAN"), technicianController.getAvailability);

/**
 * @swagger
 * /api/technician/profile:
 *   put:
 *     tags: [Technicians]
 *     summary: Update technician profile
 *     description: Update the authenticated technician's profile details.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/TechnicianProfile'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (technician only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/profile", authenticate, authorize("TECHNICIAN"), validate(updateProfileSchema), technicianController.updateProfile);

/**
 * @swagger
 * /api/technician/availability:
 *   put:
 *     tags: [Technicians]
 *     summary: Set availability slots
 *     description: Replace all availability slots for the authenticated technician. At least one slot required.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetAvailabilityInput'
 *     responses:
 *       200:
 *         description: Availability updated successfully
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
 *                   example: Availability updated successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Availability'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (technician only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/availability", authenticate, authorize("TECHNICIAN"), validate(setAvailabilitySchema), technicianController.setAvailability);

/**
 * @swagger
 * /api/technician/me:
 *   get:
 *     tags: [Technicians]
 *     summary: Get my technician profile
 *     description: Returns the authenticated technician's full profile with services and availability.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TechnicianProfile'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized (technician only)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/me", authenticate, authorize("TECHNICIAN"), technicianController.getProfile);

/**
 * @swagger
 * /api/technicians/{id}:
 *   get:
 *     tags: [Technicians]
 *     summary: Get technician by ID
 *     description: Returns full technician profile with services, availability, and recent reviews. Public endpoint.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Technician profile ID
 *     responses:
 *       200:
 *         description: Technician retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TechnicianProfile'
 *       404:
 *         description: Technician not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", technicianController.getById);

export default router;
