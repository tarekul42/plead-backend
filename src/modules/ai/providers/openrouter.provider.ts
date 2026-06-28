import { AIProvider, AIProviderResult } from "./ai-provider.interface";
import { env } from "../../../core/config/env";
import { logger } from "../../../core/utils/logger";

export class OpenRouterProvider implements AIProvider {
  readonly name = "openrouter";

  async generateJSON(params: {
    system: string;
    user: string;
    schema: Record<string, unknown>;
    temperature?: number;
  }): Promise<AIProviderResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://proplead.ai",
          "X-Title": "PropLead",
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL,
          messages: [
            { role: "system", content: params.system },
            { role: "user", content: params.user },
          ],
          response_format: { type: "json_object" },
          temperature: params.temperature ?? 0.7,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        logger.error({ status: res.status, errText }, "OpenRouter API error");
        throw new Error(`OpenRouter API error: ${res.status} ${errText}`);
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
      };
      const text = json.choices?.[0]?.message?.content;
      let data: unknown = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        logger.error({ text }, "OpenRouter invalid JSON response");
        throw new Error("Invalid JSON response from OpenRouter");
      }
      const tokensUsed = json.usage?.total_tokens ?? 0;

      return { data, tokensUsed };
    } finally {
      clearTimeout(timeout);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.generateJSON({
        system: "You are a helpful assistant.",
        user: "Say OK.",
        schema: { type: "object", properties: { ok: { type: "boolean" } } },
        temperature: 0,
      });
      return true;
    } catch {
      return false;
    }
  }
}
