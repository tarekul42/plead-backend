import { StrictRole } from "../../middleware/rbac.middleware";

describe("rbac middleware (StrictRole)", () => {
  it("calls next without error when the user has an allowed role", () => {
    const req = { user: { id: "1", role: "admin" } };
    const next = jest.fn();

    StrictRole("admin", "manager")(req as never, {} as never, next);

    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("is case-sensitive on role names", () => {
    const req = { user: { id: "1", role: "Admin" } };
    const next = jest.fn();

    StrictRole("admin")(req as never, {} as never, next);

    const err = next.mock.calls[0][0];
    expect(err.code).toBe("FORBIDDEN");
  });

  it("calls next with ForbiddenError when the role is not allowed", () => {
    const req = { user: { id: "1", role: "agent" } };
    const next = jest.fn();

    StrictRole("admin")(req as never, {} as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Insufficient role");
  });

  it("calls next with ForbiddenError when req.user is missing", () => {
    const req = {};
    const next = jest.fn();

    StrictRole("admin")(req as never, {} as never, next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Not authenticated");
  });

  it("allows a single role", () => {
    const req = { user: { id: "1", role: "manager" } };
    const next = jest.fn();

    StrictRole("manager")(req as never, {} as never, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("works with no allowed roles defined (denies everyone)", () => {
    const req = { user: { id: "1", role: "admin" } };
    const next = jest.fn();

    StrictRole()(req as never, {} as never, next);

    const err = next.mock.calls[0][0];
    expect(err.code).toBe("FORBIDDEN");
  });

  it("does not modify req or res", () => {
    const req = { user: { id: "1", role: "admin" } };
    const res = { status: jest.fn() };
    const next = jest.fn();

    StrictRole("admin")(req as never, res as never, next);

    expect(req).toEqual({ user: { id: "1", role: "admin" } });
    expect(res.status).not.toHaveBeenCalled();
  });
});
