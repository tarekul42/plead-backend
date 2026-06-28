import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { env } from "./core/config/env";
import { requestLogger } from "./core/middleware/request-logger.middleware";
import { globalRateLimit, aiRateLimit } from "./core/middleware/rate-limit.middleware";
import { sanitizeMiddleware } from "./core/middleware/sanitize.middleware";
import { xssSanitizeMiddleware } from "./core/middleware/xss.middleware";
import { hppMiddleware } from "./core/middleware/hpp.middleware";
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
import { authRouter } from "./modules/auth";
import { usersRouter } from "./modules/users";

import { GeminiProvider } from "./modules/ai/providers/gemini.provider";
import { GroqProvider } from "./modules/ai/providers/groq.provider";
import { OpenRouterProvider } from "./modules/ai/providers/openrouter.provider";

import cookieParser from "cookie-parser";

let healthCache: { status: string; expiresAt: number } | null = null;
const HEALTH_CACHE_TTL = 30_000;

async function getAIProviderHealth() {
  const now = Date.now();
  if (healthCache && healthCache.expiresAt > now) return healthCache.status;
  const gemini = new GeminiProvider();
  const groq = new GroqProvider();
  const openrouter = new OpenRouterProvider();
  const results = await Promise.allSettled([
    env.GEMINI_API_KEY ? gemini.isHealthy() : Promise.resolve(false),
    env.GROQ_API_KEY ? groq.isHealthy() : Promise.resolve(false),
    env.OPENROUTER_API_KEY ? openrouter.isHealthy() : Promise.resolve(false),
  ]);
  const anyHealthy = results.some((r) => r.status === "fulfilled" && r.value);
  const status = anyHealthy ? "healthy" : "degraded";
  healthCache = { status, expiresAt: now + HEALTH_CACHE_TTL };
  return status;
}

const app = express();

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.tile.openstreetmap.org"],
      connectSrc: ["'self'", env.CORS_ORIGIN, "https://api.clerk.com", "https://clerk.plead.lcl"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://accounts.clerk.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = env.CORS_ORIGIN.split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));
app.use(cookieParser());

// Security middlewares
app.use(sanitizeMiddleware);
app.use(xssSanitizeMiddleware);
app.use(hppMiddleware);

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

app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.get("/api/v1/demo-credentials", (_req, res) => {
  res.json({
    success: true,
    accounts: [
      { role: "agent", email: env.DEMO_AGENT_EMAIL, password: env.DEMO_AGENT_PASSWORD },
      { role: "manager", email: env.DEMO_MANAGER_EMAIL, password: env.DEMO_MANAGER_PASSWORD },
      { role: "admin", email: env.DEMO_ADMIN_EMAIL, password: env.DEMO_ADMIN_PASSWORD },
    ],
  });
});

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "PropLead API is running",
    version: "1.0.0"
  });
});

app.get("/health", async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown";

  const aiStatus = await getAIProviderHealth();

  res.json({
    status: dbState === 1 && aiStatus === "healthy" ? "ok" : "degraded",
    db: dbStatus,
    ai: { status: aiStatus, configured: ["gemini", "openrouter", "groq"].filter((p) => { switch (p) { case "gemini": return !!env.GEMINI_API_KEY; case "openrouter": return !!env.OPENROUTER_API_KEY; case "groq": return !!env.GROQ_API_KEY; default: return false; } }) },
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: process.memoryUsage().rss,
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/agencies", agenciesRouter);
app.use("/api/v1/properties", propertiesRouter);
app.use("/api/v1/leads", leadsRouter);
app.use("/api/v1", interactionsRouter);
app.use("/api/v1", reviewsRouter);
app.use("/api/v1/blog", blogsRouter);
app.use("/api/v1/ai", aiRateLimit, aiRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/users", usersRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
