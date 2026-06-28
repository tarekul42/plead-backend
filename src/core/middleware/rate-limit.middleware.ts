import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const createRateLimiter = (
  windowMs: number,
  max: number,
  options?: {
    keyGenerator?: (req: Express.Request) => string;
    message?: Record<string, unknown>;
  },
) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options?.keyGenerator,
    message: options?.message ?? undefined,
  });

export const globalRateLimit = createRateLimiter(env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX);

export const authRateLimit = createRateLimiter(15 * 60 * 1000, 10, {
  message: { success: false, error: { code: "AUTH_RATE_LIMITED", message: "Too many auth attempts" } },
});

export const apiRateLimit = createRateLimiter(60 * 1000, 60, {
  message: { success: false, error: { code: "API_RATE_LIMITED", message: "Too many requests" } },
});

export const aiRateLimit = createRateLimiter(60 * 60 * 1000, env.AI_RATE_LIMIT_PER_USER_PER_HOUR, {
  // no custom keyGenerator needed — uses default
  message: { success: false, error: { code: "AI_RATE_LIMITED", message: "AI quota exceeded" } },
});
