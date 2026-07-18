import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./config";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FixItNow API",
      version: "1.0.0",
      description: "Your Trusted Home Service Platform - Backend API",
      contact: { name: "FixItNow Team" },
    },
    servers: [
      { url: `http://localhost:${config.port}`, description: "Development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: { type: "string", minLength: 2 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            phone: { type: "string" },
            address: { type: "string" },
            role: { type: "string", enum: ["CUSTOMER", "TECHNICIAN"] },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        CreateBookingInput: {
          type: "object",
          required: ["technicianId", "serviceId", "date", "time", "address"],
          properties: {
            technicianId: { type: "string", format: "uuid" },
            serviceId: { type: "string", format: "uuid" },
            date: { type: "string", format: "date" },
            time: { type: "string", example: "09:00-11:00" },
            address: { type: "string" },
            note: { type: "string" },
          },
        },
        CreatePaymentInput: {
          type: "object",
          required: ["bookingId"],
          properties: {
            bookingId: { type: "string", format: "uuid" },
            provider: { type: "string", enum: ["STRIPE", "SSLCOMMERZ"], default: "STRIPE" },
          },
        },
        ConfirmPaymentInput: {
          type: "object",
          required: ["bookingId", "sessionId"],
          properties: {
            bookingId: { type: "string", format: "uuid" },
            sessionId: { type: "string" },
          },
        },
        CreateReviewInput: {
          type: "object",
          required: ["bookingId", "rating"],
          properties: {
            bookingId: { type: "string", format: "uuid" },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string" },
          },
        },
        CreateCategoryInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            icon: { type: "string" },
          },
        },
        CreateServiceInput: {
          type: "object",
          required: ["title", "price", "duration", "categoryId"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            duration: { type: "integer" },
            location: { type: "string" },
            categoryId: { type: "string", format: "uuid" },
          },
        },
        UpdateProfileInput: {
          type: "object",
          properties: {
            bio: { type: "string" },
            experience: { type: "integer" },
            hourlyRate: { type: "number" },
            skills: { type: "array", items: { type: "string" } },
            location: { type: "string" },
            serviceArea: { type: "string" },
            profileImage: { type: "string" },
          },
        },
        SetAvailabilityInput: {
          type: "object",
          required: ["slots"],
          properties: {
            slots: {
              type: "array",
              items: {
                type: "object",
                required: ["dayOfWeek", "startTime", "endTime"],
                properties: {
                  dayOfWeek: { type: "integer", minimum: 0, maximum: 6 },
                  startTime: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                  endTime: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "array", items: {} },
            meta: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errorDetails: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Categories", description: "Service categories" },
      { name: "Services", description: "Services offered by technicians" },
      { name: "Technicians", description: "Technician profiles and availability" },
      { name: "Bookings", description: "Booking management" },
      { name: "Payments", description: "Payment processing (Stripe / SSLCommerz)" },
      { name: "Reviews", description: "Customer reviews" },
      { name: "Admin", description: "Admin management endpoints" },
    ],
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/docs/**/*.yaml"],
};

export const swaggerSpec = swaggerJsdoc(options);
