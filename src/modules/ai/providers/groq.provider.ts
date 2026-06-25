import { AIProvider, AIProviderResult } from "./ai-provider.interface";
import { env } from "../../../core/config/env";
import { logger } from "../../../core/utils/logger";

export class GroqProvider implements AIProvider {
  readonly name = "groq";

  async generateJSON(params: {
    system: string;
    user: string;
    schema: Record<string, unknown>;
    temperature?: number;
  }): Promise<AIProviderResult> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
        response_format: { type: "json_object" },
        temperature: params.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error({ status: res.status, errText }, "Groq API error");
      throw new Error(`Groq API error: ${res.status} ${errText}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { total_tokens?: number };
    };
    const text = json.choices?.[0]?.message?.content;
    const data = text ? JSON.parse(text) : null;
    const tokensUsed = json.usage?.total_tokens ?? 0;

    return { data, tokensUsed };
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
