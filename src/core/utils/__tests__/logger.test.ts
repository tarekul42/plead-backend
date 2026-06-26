import { logger } from "../logger";

describe("logger", () => {
  it("is created with pino", () => {
    expect(logger).toBeDefined();
    expect(typeof logger).toBe("object");
  });

  it("has info method", () => {
    expect(typeof logger.info).toBe("function");
  });

  it("has warn method", () => {
    expect(typeof logger.warn).toBe("function");
  });

  it("has error method", () => {
    expect(typeof logger.error).toBe("function");
  });

  it("has fatal method", () => {
    expect(typeof logger.fatal).toBe("function");
  });

  it("has debug method", () => {
    expect(typeof logger.debug).toBe("function");
  });
});
