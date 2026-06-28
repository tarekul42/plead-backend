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

const providerOrder = ["gemini", "openrouter", "groq"];

function isProviderConfigured(name: string): boolean {
  switch (name) {
    case "gemini":
      return !!env.GEMINI_API_KEY;
    case "groq":
      return !!env.GROQ_API_KEY;
    case "openrouter":
      return !!env.OPENROUTER_API_KEY;
    default:
      return false;
  }
}

export async function callAIWithFallback(params: {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  temperature?: number;
}): Promise<{ data: unknown; tokensUsed: number; provider: string }> {
  const available = providerOrder.filter((name) => isProviderConfigured(name));
  if (available.length === 0) {
    throw new Error("No AI providers configured");
  }

  const errors: string[] = [];
  for (const name of available) {
    const provider = providers[name];
    if (!provider) continue;
    try {
      const result = await provider.generateJSON(params);
      return { ...result, provider: provider.name };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ err, provider: name }, `${name} AI failed`);
      errors.push(`${name}: ${message}`);
    }
  }

  logger.error({ errors }, "All AI providers failed");
  throw new Error("AI providers unavailable");
}
