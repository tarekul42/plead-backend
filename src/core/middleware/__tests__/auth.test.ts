import { Request, Response } from "express";
import { UnauthorizedError } from "../../utils/app-error";

jest.mock("@clerk/express", () => ({
  requireAuth: jest.fn(() => (req: any, _res: any, next: any) => next()),
}));

jest.mock("../../../modules/users", () => ({
  UsersService: {
    getByClerkId: jest.fn(),
  },
}));

const { UsersService } = jest.requireMock("../../../modules/users");
const { requireAuth } = jest.requireActual("../auth.middleware");

function mockReq(auth?: { userId?: string }) {
  return {
    auth,
    user: undefined,
  } as Request & { auth?: { userId?: string }; user?: Record<string, string> };
}

function mockRes() {
  const res: Partial<Response> = {};
  return res as Response;
}

describe("requireAuth middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets req.user when auth is valid and user exists", async () => {
    const req = mockReq({ userId: "clerk_123" });
    const res = mockRes();
    const next = jest.fn();

    UsersService.getByClerkId.mockResolvedValue({
      _id: { toString: () => "db_123" },
      clerkId: "clerk_123",
      email: "user@test.com",
      role: "agent",
      agencyId: { toString: () => "agency_123" },
      isActive: true,
    });

    const middleware = requireAuth[1];
    await middleware(req, res, next);

    expect(req.user).toEqual({
      id: "db_123",
      clerkId: "clerk_123",
      email: "user@test.com",
      role: "agent",
      agencyId: "agency_123",
    });
    expect(next).toHaveBeenCalledWith();
  });

  it("throws UnauthorizedError when auth.userId is missing", async () => {
    const req = mockReq({});
    const res = mockRes();
    const next = jest.fn();

    const middleware = requireAuth[1];
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("throws UnauthorizedError when db user is not found", async () => {
    const req = mockReq({ userId: "clerk_123" });
    const res = mockRes();
    const next = jest.fn();

    UsersService.getByClerkId.mockResolvedValue(null);

    const middleware = requireAuth[1];
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("throws UnauthorizedError when db user is inactive", async () => {
    const req = mockReq({ userId: "clerk_123" });
    const res = mockRes();
    const next = jest.fn();

    UsersService.getByClerkId.mockResolvedValue({
      _id: { toString: () => "db_123" },
      clerkId: "clerk_123",
      email: "user@test.com",
      role: "agent",
      agencyId: { toString: () => "agency_123" },
      isActive: false,
    });

    const middleware = requireAuth[1];
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("sets agencyId to empty string when agencyId is null", async () => {
    const req = mockReq({ userId: "clerk_123" });
    const res = mockRes();
    const next = jest.fn();

    UsersService.getByClerkId.mockResolvedValue({
      _id: { toString: () => "db_123" },
      clerkId: "clerk_123",
      email: "user@test.com",
      role: "agent",
      agencyId: null,
      isActive: true,
    });

    const middleware = requireAuth[1];
    await middleware(req, res, next);

    expect(req.user!.agencyId).toBe("");
    expect(next).toHaveBeenCalledWith();
  });
});
