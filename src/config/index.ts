import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  sslCommerzStoreId: process.env.SSLCOMMERZ_STORE_ID || "",
  sslCommerzStorePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || "",
  sslCommerzIsLive: process.env.SSLCOMMERZ_IS_LIVE === "true",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};
