describe("config/env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function withEnv(overrides: Record<string, string | undefined>) {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://localhost:27017/test",
      CLERK_SECRET_KEY: "sk_test_dummy",
      CLERK_WEBHOOK_SECRET: "whsec_dummy",
      GEMINI_API_KEY: "AIza_dummy",
      GROQ_API_KEY: "gsk_dummy",
      CLOUDINARY_CLOUD_NAME: "dummy",
      CLOUDINARY_API_KEY: "dummy",
      CLOUDINARY_API_SECRET: "dummy",
      CORS_ORIGIN: "*",
      ...overrides,
    };
  }

  it("parses a valid environment", async () => {
    withEnv({ PORT: undefined });
    const { env } = await import("../../config/env");
    expect(env.PORT).toBe(8080);
    expect(env.NODE_ENV).toBe("test");
    expect(env.MONGODB_URI).toBe("mongodb://localhost:27017/test");
  });

  it("coerces PORT to a number", async () => {
    withEnv({ PORT: "4000" });
    const { env } = await import("../../config/env");
    expect(env.PORT).toBe(4000);
  });

  it("defaults PORT to 8080 when unset", async () => {
    withEnv({ PORT: undefined });
    const { env } = await import("../../config/env");
    expect(env.PORT).toBe(8080);
  });

  it("defaults NODE_ENV to development when unset", async () => {
    withEnv({ NODE_ENV: undefined });
    const { env } = await import("../../config/env");
    expect(env.NODE_ENV).toBe("development");
  });

  it("accepts production NODE_ENV", async () => {
    withEnv({ NODE_ENV: "production" });
    const { env } = await import("../../config/env");
    expect(env.NODE_ENV).toBe("production");
  });

  it("rejects an invalid NODE_ENV", async () => {
    withEnv({ NODE_ENV: "staging" });
    await expect(import("../../config/env")).rejects.toThrow();
  });

  it("requires MONGODB_URI to be non-empty", async () => {
    withEnv({ MONGODB_URI: "" });
    await expect(import("../../config/env")).rejects.toThrow();
  });

  it("requires CLERK_SECRET_KEY to start with sk_", async () => {
    withEnv({ CLERK_SECRET_KEY: "bad" });
    await expect(import("../../config/env")).rejects.toThrow();
  });

  it("requires CLERK_WEBHOOK_SECRET to start with whsec_", async () => {
    withEnv({ CLERK_WEBHOOK_SECRET: "bad" });
    await expect(import("../../config/env")).rejects.toThrow();
  });

  it("accepts any GEMINI_API_KEY in non-production", async () => {
    withEnv({ GEMINI_API_KEY: "bad" });
    const { env } = await import("../../config/env");
    expect(env.GEMINI_API_KEY).toBe("bad");
  });

  it("accepts any GROQ_API_KEY in non-production", async () => {
    withEnv({ GROQ_API_KEY: "bad" });
    const { env } = await import("../../config/env");
    expect(env.GROQ_API_KEY).toBe("bad");
  });

  it("defaults GEMINI_MODEL", async () => {
    withEnv({});
    const { env } = await import("../../config/env");
    expect(env.GEMINI_MODEL).toBe("gemini-1.5-flash");
  });

  it("defaults GROQ_MODEL", async () => {
    withEnv({});
    const { env } = await import("../../config/env");
    expect(env.GROQ_MODEL).toBe("llama-3.1-8b-instant");
  });

  it("defaults OPENROUTER_MODEL", async () => {
    withEnv({});
    const { env } = await import("../../config/env");
    expect(env.OPENROUTER_MODEL).toBe("google/gemma-2-9b-it:free");
  });

  it("coerces AI_CACHE_TTL_HOURS to a number with a default of 24", async () => {
    withEnv({ AI_CACHE_TTL_HOURS: "12" });
    const { env } = await import("../../config/env");
    expect(env.AI_CACHE_TTL_HOURS).toBe(12);

    jest.resetModules();
    withEnv({ AI_CACHE_TTL_HOURS: undefined });
    const { env: env2 } = await import("../../config/env");
    expect(env2.AI_CACHE_TTL_HOURS).toBe(24);
  });

  it("coerces rate limit values to numbers with defaults", async () => {
    withEnv({});
    const { env } = await import("../../config/env");
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(900000);
    expect(env.RATE_LIMIT_MAX).toBe(10000);
  });

  it("accepts empty Cloudinary credentials in non-production", async () => {
    withEnv({ CLOUDINARY_CLOUD_NAME: "" });
    const { env } = await import("../../config/env");
    expect(env.CLOUDINARY_CLOUD_NAME).toBe("");
  });

  it("requires CORS_ORIGIN to be non-empty", async () => {
    withEnv({ CORS_ORIGIN: "" });
    await expect(import("../../config/env")).rejects.toThrow();
  });

  it("makes SENTRY_DSN optional", async () => {
    withEnv({ SENTRY_DSN: undefined });
    const { env } = await import("../../config/env");
    expect(env.SENTRY_DSN).toBeUndefined();
  });

  it("accepts a provided SENTRY_DSN", async () => {
    withEnv({ SENTRY_DSN: "https://example@sentry.io/123" });
    const { env } = await import("../../config/env");
    expect(env.SENTRY_DSN).toBe("https://example@sentry.io/123");
  });
});
