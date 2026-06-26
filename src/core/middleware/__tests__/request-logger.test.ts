const mockLoggerInstance = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
jest.mock("../../utils/logger", () => ({ logger: mockLoggerInstance }));

jest.mock("pino-http", () => jest.fn(() => (req: any, res: any, next: any) => next()));

describe("requestLogger middleware", () => {
  it("is created with pino-http", () => {
    const pinoHttp = require("pino-http");
    const { requestLogger } = require("../request-logger.middleware");
    expect(pinoHttp).toHaveBeenCalled();
    expect(requestLogger).toBeDefined();
  });
});
