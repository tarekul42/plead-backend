import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { env } from "./core/config/env";
import { requestLogger } from "./core/middleware/request-logger.middleware";
import { globalRateLimit } from "./core/middleware/rate-limit.middleware";
import { notFound } from "./core/middleware/not-found.middleware";
import { errorHandler } from "./core/middleware/error-handler.middleware";

import { propertiesRouter } from "./modules/properties";
import { leadsRouter } from "./modules/leads";
import { interactionsRouter } from "./modules/interactions";
import { reviewsRouter } from "./modules/reviews";
import { blogsRouter } from "./modules/blogs";
import { aiRouter } from "./modules/ai";
import { adminRouter } from "./modules/admin";
import { agenciesRouter } from "./modules/agencies";
import { webhooksRouter } from "./modules/webhooks";
import { usersRouter } from "./modules/users";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = env.CORS_ORIGIN.split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));
app.use(helmet());

// Raw body parser for webhooks (svix needs exact raw body for signature verification)
app.use("/api/v1/webhooks", express.raw({ type: "application/json" }));
app.use("/api/v1/webhooks", webhooksRouter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use((req, res, next) => {
  const requestId = (req.id as string) || crypto.randomUUID();
  res.setHeader("X-Request-Id", requestId);
  next();
});
app.use(globalRateLimit);

app.get("/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown";
  res.json({ status: dbState === 1 ? "ok" : "degraded", db: dbStatus, timestamp: Date.now() });
});

app.use("/api/v1/agencies", agenciesRouter);
app.use("/api/v1/properties", propertiesRouter);
app.use("/api/v1/leads", leadsRouter);
app.use("/api/v1", interactionsRouter);
app.use("/api/v1", reviewsRouter);
app.use("/api/v1/blog", blogsRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/users", usersRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
