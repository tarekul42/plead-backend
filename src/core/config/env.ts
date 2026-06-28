import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),
  CLERK_SECRET_KEY: z.string().startsWith("sk_"),
  CLERK_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  GEMINI_API_KEY: isProduction ? z.string().startsWith("AIza") : z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  GROQ_API_KEY: isProduction ? z.string().startsWith("gsk_") : z.string().optional().default(""),
  GROQ_MODEL: z.string().default("llama-3.1-8b-instant"),
  OPENROUTER_API_KEY: isProduction ? z.string().min(1) : z.string().optional().default(""),
  OPENROUTER_MODEL: z.string().default("google/gemma-2-9b-it:free"),
  AI_PROVIDER_PRIMARY: z.enum(["gemini", "groq", "openrouter"]).default("openrouter"),
  AI_PROVIDER_FALLBACK: z.enum(["gemini", "groq", "openrouter"]).default("openrouter"),
  AI_CACHE_TTL_HOURS: z.coerce.number().default(24),
  AI_RATE_LIMIT_PER_USER_PER_HOUR: z.coerce.number().default(10),
  CLOUDINARY_CLOUD_NAME: isProduction ? z.string().min(1) : z.string().optional().default(""),
  CLOUDINARY_API_KEY: isProduction ? z.string().min(1) : z.string().optional().default(""),
  CLOUDINARY_API_SECRET: isProduction ? z.string().min(1) : z.string().optional().default(""),
  CORS_ORIGIN: z.string().min(1),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  CSRF_SECRET: z.string().min(32).default("super-secret-csrf-token-change-in-production-123456"),
  UPLOAD_MAX_FILE_SIZE: z.coerce.number().default(5 * 1024 * 1024),
  UPLOAD_ALLOWED_MIME_TYPES: z.string().default("image/jpeg,image/png,image/webp,image/avif"),
  SENTRY_DSN: z.string().optional(),
  DEMO_AGENT_EMAIL: z.string().default("agent@proplead.ai"),
  DEMO_AGENT_PASSWORD: z.string().default("Ag7$k9mX!pQ2"),
  DEMO_MANAGER_EMAIL: z.string().default("manager@proplead.ai"),
  DEMO_MANAGER_PASSWORD: z.string().default("Mgr8$jL3!nR5"),
  DEMO_ADMIN_EMAIL: z.string().default("admin@proplead.ai"),
  DEMO_ADMIN_PASSWORD: z.string().default("Adm4$vB7!wX1"),
});

export const env = envSchema.parse(process.env);
