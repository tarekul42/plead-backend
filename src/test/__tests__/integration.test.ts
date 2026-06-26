import express from "express";
import request from "supertest";
import { errorHandler } from "../../core/middleware/error-handler.middleware";
import { notFound } from "../../core/middleware/not-found.middleware";
import { AppError } from "../../core/utils/app-error";

describe("Integration: error handling middleware", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
  });

  it("returns 404 for unknown routes", async () => {
    app.use(notFound);
    app.use(errorHandler);

    const res = await request(app).get("/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
  });

  it("handles AppError thrown in routes", async () => {
    app.get("/error", () => { throw new AppError(422, "VALIDATION", "Invalid input"); });
    app.use(errorHandler);

    const res = await request(app).get("/error");
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION");
  });

  it("handles syntax errors in JSON body", async () => {
    app.use(express.json());
    app.post("/test", (_req, res) => res.json({ ok: true }));
    app.use(errorHandler);

    const res = await request(app)
      .post("/test")
      .set("Content-Type", "application/json")
      .send("{malformed");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });
});
