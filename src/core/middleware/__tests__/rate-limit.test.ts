const capturedConfigs: unknown[] = [];
const mockRateLimit = jest.fn((opts: unknown) => {
  capturedConfigs.push(opts);
  return opts;
});

jest.mock("express-rate-limit", () => ({
  __esModule: true,
  default: (opts: unknown) => mockRateLimit(opts),
}));

jest.mock("../../config/env", () => ({
  env: {
    RATE_LIMIT_WINDOW_MS: 900000,
    RATE_LIMIT_MAX: 100,
    AI_RATE_LIMIT_PER_USER_PER_HOUR: 10,
  },
}));

import { globalRateLimit, aiRateLimit } from "../../middleware/rate-limit.middleware";

describe("rate-limit middleware", () => {
  // The module evaluates rateLimit() at import time, capturing configs in order.
  const globalConfig = capturedConfigs[0] as any;
  const aiConfig = capturedConfigs[3] as any;

  describe("globalRateLimit", () => {
    it("is the result of calling rateLimit with env-based config", () => {
      expect(globalRateLimit).toBe(globalConfig);
    });

    it("configures the global limiter from env values", () => {
      expect(globalConfig).toEqual({
        windowMs: 900000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
      });
    });
  });

  describe("aiRateLimit", () => {
    it("is the result of calling rateLimit with AI config", () => {
      expect(aiRateLimit).toBe(aiConfig);
    });

    it("configures the AI limiter with a 1-hour window", () => {
      expect(aiConfig.windowMs).toBe(60 * 60 * 1000);
      expect(aiConfig.max).toBe(10);
      expect(aiConfig.standardHeaders).toBe(true);
      expect(aiConfig.legacyHeaders).toBe(false);
    });

    it("returns a custom rate-limit message", () => {
      expect(aiConfig.message).toEqual({
        success: false,
        error: { code: "AI_RATE_LIMITED", message: "AI quota exceeded" },
      });
    });
  });
});
