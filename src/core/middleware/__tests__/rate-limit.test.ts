jest.mock("express-rate-limit", () => jest.fn(() => (req: any, res: any, next: any) => next()));

describe("rate limit middleware", () => {
  it("creates globalRateLimit and aiRateLimit", () => {
    const { globalRateLimit, aiRateLimit } = require("../rate-limit.middleware");
    expect(globalRateLimit).toBeDefined();
    expect(aiRateLimit).toBeDefined();
  });
});
