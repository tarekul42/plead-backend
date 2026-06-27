jest.mock("../../core/middleware/auth.middleware", () => ({
  requireAuth: (req: any, res: any, next: any) => next(),
}));

jest.mock("express-rate-limit", () => jest.fn(() => (req: any, res: any, next: any) => next()));

jest.mock("pino-http", () => jest.fn(() => (req: any, res: any, next: any) => next()));

import request from "supertest";
import mongoose from "mongoose";

let mockReadyState = 1;

jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return {
    ...actual,
    connection: new Proxy(actual.connection, {
      get(target, prop) {
        if (prop === "readyState") return mockReadyState;
        return Reflect.get(target, prop);
      },
    }),
  };
});

import { app } from "../../app";

describe("app setup", () => {
  it("has trust proxy set to 1", () => {
    expect(app.get("trust proxy")).toBe(1);
  });

  it("has CORS and helmet enabled via response headers", async () => {
    const res = await request(app).get("/health").set("Origin", "http://localhost:3000");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-frame-options"]).toBeDefined();
    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });
});

describe("health endpoint", () => {
  beforeEach(() => {
    mockReadyState = 1;
  });

  it("returns ok when DB connected", async () => {
    mockReadyState = 1;
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.db).toBe("connected");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("ai");
    expect(res.body).toHaveProperty("uptime");
  });

  it("returns degraded when DB disconnected", async () => {
    mockReadyState = 0;
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.db).toBe("disconnected");
  });

  it("returns connecting state", async () => {
    mockReadyState = 2;
    const res = await request(app).get("/health");
    expect(res.body.db).toBe("connecting");
  });

  it("returns disconnecting state", async () => {
    mockReadyState = 3;
    const res = await request(app).get("/health");
    expect(res.body.db).toBe("disconnecting");
  });
});

describe("API", () => {
  it("sets X-Request-Id header on responses", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-request-id"]).toBeDefined();
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/nonexistent-route");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
  });

  it("returns 200 for health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });
});
