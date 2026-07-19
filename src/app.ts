import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import { requestLogger } from "./middlewares/requestLogger";
import { config } from "./config";
import { swaggerSpec } from "./swagger";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api", limiter);

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "FixItNow API is running", timestamp: new Date().toISOString() });
});

app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: "/api-docs.json",
  },
  customSiteTitle: "FixItNow API Documentation",
  customCss: ".swagger-ui .topbar { display: none }",
}));

app.use("/api", routes);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to FixItNow Backend API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
