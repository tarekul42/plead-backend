import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const globalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: env.AI_RATE_LIMIT_PER_USER_PER_HOUR,
  keyGenerator: (req) => String(req.user?.id || req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "AI_RATE_LIMITED", message: "AI quota exceeded" } },
});
