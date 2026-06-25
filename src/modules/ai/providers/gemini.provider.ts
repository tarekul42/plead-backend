import { AIProvider, AIProviderResult } from "./ai-provider.interface";
import { env } from "../../../core/config/env";
import { logger } from "../../../core/utils/logger";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";

  async generateJSON(params: {
    system: string;
    user: string;
    schema: Record<string, unknown>;
    temperature?: number;
  }): Promise<AIProviderResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`;

    const body = {
      systemInstruction: {
        parts: [{ text: params.system }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: params.user }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: params.temperature ?? 0.7,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error({ status: res.status, errText }, "Gemini API error");
      throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { totalTokenCount?: number };
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    const data = text ? JSON.parse(text) : null;
    const tokensUsed = json.usageMetadata?.totalTokenCount ?? 0;

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
