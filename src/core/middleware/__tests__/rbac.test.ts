import { Request, Response } from "express";
import { StrictRole } from "../rbac.middleware";

function mockReq(user?: Record<string, string>) {
  return { user } as Request;
}

function mockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as unknown as Response;
}

describe("StrictRole", () => {
  it("calls next() when user has required role", () => {
    const req = mockReq({ role: "admin", id: "1" });
    const res = mockRes();
    const next = jest.fn();

    StrictRole("admin")(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("calls next with ForbiddenError when role does not match", () => {
    const req = mockReq({ role: "agent", id: "1" });
    const res = mockRes();
    const next = jest.fn();

    StrictRole("admin")(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, code: "FORBIDDEN" }));
  });

  it("calls next with ForbiddenError when user is not authenticated", () => {
    const req = mockReq(undefined);
    const res = mockRes();
    const next = jest.fn();

    StrictRole("admin")(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it("accepts multiple roles", () => {
    const req = mockReq({ role: "manager", id: "1" });
    const res = mockRes();
    const next = jest.fn();

    StrictRole("admin", "manager")(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
