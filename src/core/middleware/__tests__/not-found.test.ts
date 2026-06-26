import { Request, Response } from "express";
import { notFound } from "../not-found.middleware";

describe("notFound middleware", () => {
  it("returns 404 with route not found message", () => {
    const req = { originalUrl: "/unknown", path: "/unknown" } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    notFound(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
  });
});
