import { env } from "./env";

export const aiConfig = {
  primary: env.AI_PROVIDER_PRIMARY,
  fallback: env.AI_PROVIDER_FALLBACK,
  gemini: {
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL,
  },
  groq: {
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL,
  },
  cacheTtlHours: env.AI_CACHE_TTL_HOURS,
  rateLimitPerUserPerHour: env.AI_RATE_LIMIT_PER_USER_PER_HOUR,
};
