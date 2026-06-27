import { notFound } from "../../middleware/not-found.middleware";

describe("not-found middleware", () => {
  it("responds with 404 status", () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    notFound({} as never, res as never);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns a NOT_FOUND error envelope", () => {
    const json = jest.fn();
    const res = { status: jest.fn().mockReturnThis(), json };
    notFound({} as never, res as never);

    expect(json).toHaveBeenCalledWith({
      success: false,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
  });

  it("ignores the request object", () => {
    const json = jest.fn();
    const res = { status: jest.fn().mockReturnThis(), json };
    const req = { method: "GET", path: "/api/unknown" };

    notFound(req as never, res as never);

    expect(json).toHaveBeenCalledTimes(1);
  });
});
