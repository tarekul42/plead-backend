import { AIProvider } from "./ai-provider.interface";
import { GeminiProvider } from "./gemini.provider";
import { GroqProvider } from "./groq.provider";
import { OpenRouterProvider } from "./openrouter.provider";
import { env } from "../../../core/config/env";
import { logger } from "../../../core/utils/logger";

const providers: Record<string, AIProvider> = {
  gemini: new GeminiProvider(),
  groq: new GroqProvider(),
  openrouter: new OpenRouterProvider(),
};

export async function callAIWithFallback(params: {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  temperature?: number;
}): Promise<{ data: unknown; tokensUsed: number; provider: string }> {
  const primary = providers[env.AI_PROVIDER_PRIMARY];
  if (!primary) throw new Error(`Unknown primary AI provider: ${env.AI_PROVIDER_PRIMARY}`);
  const fallback = providers[env.AI_PROVIDER_FALLBACK];
  if (!fallback) throw new Error(`Unknown fallback AI provider: ${env.AI_PROVIDER_FALLBACK}`);

  try {
    const result = await primary.generateJSON(params);
    return { ...result, provider: primary.name };
  } catch (err) {
    logger.error({ err }, "Primary AI failed, trying fallback");
    try {
      const result = await fallback.generateJSON(params);
      return { ...result, provider: fallback.name };
    } catch (fallbackErr) {
      logger.error({ fallbackErr }, "Both AI providers failed");
      throw new Error("AI providers unavailable");
    }
  }
}
