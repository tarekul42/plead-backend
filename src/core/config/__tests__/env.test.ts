jest.mock("dotenv", () => ({ config: jest.fn() }));

describe("env config", () => {
  const OLD_ENV = { ...process.env };

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("exports env with default values", () => {
    jest.resetModules();
    const { env } = require("../env");
    expect(env.PORT).toBe(8080);
    expect(env.NODE_ENV).toBe("test");
  });

  it("fails validation when CLERK_SECRET_KEY has wrong prefix", () => {
    jest.resetModules();
    process.env.CLERK_SECRET_KEY = "bad_prefix";
    expect(() => require("../env")).toThrow();
    process.env.CLERK_SECRET_KEY = OLD_ENV.CLERK_SECRET_KEY;
  });

  it("fails validation when MONGODB_URI is invalid", () => {
    jest.resetModules();
    process.env.MONGODB_URI = "not-a-url";
    expect(() => require("../env")).toThrow();
    process.env.MONGODB_URI = OLD_ENV.MONGODB_URI;
  });
});
