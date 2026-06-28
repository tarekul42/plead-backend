const mockGeminiGenerate = jest.fn();
const mockGroqGenerate = jest.fn();

jest.mock("../providers/gemini.provider", () => ({
  GeminiProvider: jest.fn(() => ({
    name: "gemini",
    generateJSON: mockGeminiGenerate,
  })),
}));

jest.mock("../providers/groq.provider", () => ({
  GroqProvider: jest.fn(() => ({
    name: "groq",
    generateJSON: mockGroqGenerate,
  })),
}));

jest.mock("../../../core/utils/logger", () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

const mockEnv: Record<string, string | undefined> = {
  AI_PROVIDER_PRIMARY: "gemini",
  AI_PROVIDER_FALLBACK: "groq",
  GEMINI_API_KEY: "sk-gemini-test",
  GROQ_API_KEY: "sk-groq-test",
};
jest.mock("../../../core/config/env", () => ({ env: mockEnv }));

import { callAIWithFallback } from "../providers/provider.factory";

describe("callAIWithFallback", () => {
  const params = {
    system: "system",
    user: "user",
    schema: { type: "object" as const },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEnv.AI_PROVIDER_PRIMARY = "gemini";
    mockEnv.AI_PROVIDER_FALLBACK = "groq";
  });

  it("returns primary provider result on success", async () => {
    mockGeminiGenerate.mockResolvedValue({ data: { ok: true }, tokensUsed: 10 });
    const result = await callAIWithFallback(params);
    expect(result.provider).toBe("gemini");
    expect(result.data).toEqual({ ok: true });
  });

  it("falls back to secondary when primary fails", async () => {
    mockGeminiGenerate.mockRejectedValue(new Error("primary down"));
    mockGroqGenerate.mockResolvedValue({ data: { ok: true }, tokensUsed: 5 });

    const result = await callAIWithFallback(params);
    expect(result.provider).toBe("groq");
  });

  it("throws when both providers fail", async () => {
    mockGeminiGenerate.mockRejectedValue(new Error("primary down"));
    mockGroqGenerate.mockRejectedValue(new Error("fallback down"));

    await expect(callAIWithFallback(params)).rejects.toThrow("AI providers unavailable");
  });

  it("skips unknown primary provider and uses fallback", async () => {
    mockEnv.AI_PROVIDER_PRIMARY = "unknown";
    mockGeminiGenerate.mockResolvedValue({ data: { ok: true }, tokensUsed: 10 });

    const result = await callAIWithFallback(params);
    // The "unknown" provider doesn't exist in the registry, so it's skipped.
    // The function falls through to gemini which is configured.
    expect(result.provider).toBe("gemini");
  });

  it("skips unknown fallback provider and still throws when all known fail", async () => {
    mockEnv.AI_PROVIDER_FALLBACK = "nonexistent";
    mockGeminiGenerate.mockRejectedValue(new Error("primary down"));
    mockGroqGenerate.mockRejectedValue(new Error("also down"));

    await expect(callAIWithFallback(params)).rejects.toThrow("AI providers unavailable");
  });
});
