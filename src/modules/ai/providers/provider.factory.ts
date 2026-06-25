import { AIProvider } from "./ai-provider.interface";
import { GeminiProvider } from "./gemini.provider";
import { GroqProvider } from "./groq.provider";
import { env } from "../../../core/config/env";
import { logger } from "../../../core/utils/logger";

const providers: Record<string, AIProvider> = {
  gemini: new GeminiProvider(),
  groq: new GroqProvider(),
};

let cachedPrimary: AIProvider | null = null;
let lastHealthCheck = 0;

export async function getAIProvider(): Promise<AIProvider> {
  const now = Date.now();
  const primary = providers[env.AI_PROVIDER_PRIMARY];
  const fallback = providers[env.AI_PROVIDER_FALLBACK];

  if (now - lastHealthCheck > 60_000) {
    lastHealthCheck = now;
    const healthy = await primary.isHealthy();
    cachedPrimary = healthy ? primary : fallback;
    if (!healthy) {
      logger.warn("Primary AI provider unhealthy, falling back");
    }
  }

  return cachedPrimary ?? primary;
}

export async function callAIWithFallback(params: {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  temperature?: number;
}): Promise<{ data: unknown; tokensUsed: number; provider: string }> {
  const primary = providers[env.AI_PROVIDER_PRIMARY];
  const fallback = providers[env.AI_PROVIDER_FALLBACK];

  try {
    const result = await primary.generateJSON(params);
    return { ...result, provider: primary.name };
  } catch (err) {
    logger.error({ err }, "Primary AI failed, trying fallback");
    const result = await fallback.generateJSON(params);
    return { ...result, provider: fallback.name };
  }
}
