import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().url(),
  CLERK_SECRET_KEY: z.string().startsWith("sk_"),
  CLERK_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  GEMINI_API_KEY: z.string().startsWith("AIza"),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  GROQ_API_KEY: z.string().startsWith("gsk_"),
  GROQ_MODEL: z.string().default("llama-3.1-8b-instant"),
  AI_PROVIDER_PRIMARY: z.enum(["gemini", "groq"]).default("gemini"),
  AI_PROVIDER_FALLBACK: z.enum(["gemini", "groq"]).default("groq"),
  AI_CACHE_TTL_HOURS: z.coerce.number().default(24),
  AI_RATE_LIMIT_PER_USER_PER_HOUR: z.coerce.number().default(10),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  SENTRY_DSN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
