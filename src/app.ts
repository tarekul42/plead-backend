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

import { GeminiProvider } from "./modules/ai/providers/gemini.provider";
import { GroqProvider } from "./modules/ai/providers/groq.provider";

let healthCache: { status: string; expiresAt: number } | null = null;
const HEALTH_CACHE_TTL = 30_000;

async function getAIProviderHealth() {
  const now = Date.now();
  if (healthCache && healthCache.expiresAt > now) return healthCache.status;
  const gemini = new GeminiProvider();
  const groq = new GroqProvider();
  const [geminiHealthy, groqHealthy] = await Promise.all([
    gemini.isHealthy().catch(() => false),
    groq.isHealthy().catch(() => false),
  ]);
  const status = geminiHealthy || groqHealthy ? "healthy" : "degraded";
  healthCache = { status, expiresAt: now + HEALTH_CACHE_TTL };
  return status;
}

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = env.CORS_ORIGIN.split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) return cb(null, true);
    cb(null, false);
  },
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

app.get("/health", async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown";

  const aiStatus = await getAIProviderHealth();

  res.json({
    status: dbState === 1 && aiStatus === "healthy" ? "ok" : "degraded",
    db: dbStatus,
    ai: { status: aiStatus, primary: env.AI_PROVIDER_PRIMARY, fallback: env.AI_PROVIDER_FALLBACK },
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage().rss,
  });
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
