import { GeminiProvider } from "../providers/gemini.provider";
import { GroqProvider } from "../providers/groq.provider";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("GeminiProvider", () => {
  let provider: GeminiProvider;
  beforeEach(() => {
    jest.clearAllMocks();
    provider = new GeminiProvider();
  });

  it("name is gemini", () => {
    expect(provider.name).toBe("gemini");
  });

  it("generateJSON returns parsed data on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }],
        usageMetadata: { totalTokenCount: 42 },
      }),
    });

    const result = await provider.generateJSON({ system: "sys", user: "usr", schema: {} });
    expect(result.data).toEqual({ ok: true });
    expect(result.tokensUsed).toBe(42);
  });

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue("Bad Request"),
    });

    await expect(provider.generateJSON({ system: "sys", user: "usr", schema: {} })).rejects.toThrow(
      "Gemini API error: 400",
    );
  });

  it("throws on invalid JSON response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        candidates: [{ content: { parts: [{ text: "not json" }] } }],
      }),
    });

    await expect(provider.generateJSON({ system: "sys", user: "usr", schema: {} })).rejects.toThrow(
      "Invalid JSON response from Gemini",
    );
  });

  it("isHealthy returns true on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }],
        usageMetadata: { totalTokenCount: 3 },
      }),
    });

    const healthy = await provider.isHealthy();
    expect(healthy).toBe(true);
  });

  it("isHealthy returns false on failure", async () => {
    mockFetch.mockRejectedValue(new Error("network error"));
    const healthy = await provider.isHealthy();
    expect(healthy).toBe(false);
  });
});

describe("GroqProvider", () => {
  let provider: GroqProvider;
  beforeEach(() => {
    jest.clearAllMocks();
    provider = new GroqProvider();
  });

  it("name is groq", () => {
    expect(provider.name).toBe("groq");
  });

  it("generateJSON returns parsed data on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: '{"ok":true}' } }],
        usage: { total_tokens: 15 },
      }),
    });

    const result = await provider.generateJSON({ system: "sys", user: "usr", schema: {} });
    expect(result.data).toEqual({ ok: true });
    expect(result.tokensUsed).toBe(15);
  });

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: jest.fn().mockResolvedValue("Unauthorized"),
    });

    await expect(provider.generateJSON({ system: "sys", user: "usr", schema: {} })).rejects.toThrow(
      "Groq API error: 401",
    );
  });

  it("throws on invalid JSON response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: "bad json" } }],
      }),
    });

    await expect(provider.generateJSON({ system: "sys", user: "usr", schema: {} })).rejects.toThrow(
      "Invalid JSON response from Groq",
    );
  });

  it("isHealthy returns true on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: '{"ok":true}' } }],
        usage: { total_tokens: 3 },
      }),
    });

    const healthy = await provider.isHealthy();
    expect(healthy).toBe(true);
  });

  it("isHealthy returns false on failure", async () => {
    mockFetch.mockRejectedValue(new Error("network error"));
    const healthy = await provider.isHealthy();
    expect(healthy).toBe(false);
  });
});
