import { Request, Response } from "express";

jest.mock("@clerk/express", () => ({
  requireAuth: jest.fn(() => (req: any, _res: any, next: any) => next()),
  createClerkClient: jest.fn(() => ({
    users: {
      getUser: jest.fn().mockResolvedValue({
        emailAddresses: [{ id: "email_1", emailAddress: "auto@test.com" }],
        primaryEmailAddressId: "email_1",
        firstName: "Auto",
        lastName: "Created",
      }),
    },
  })),
}));

jest.mock("../../../modules/users", () => ({
  UsersService: {
    getByClerkId: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../../modules/agencies/agencies.model", () => ({
  AgencyModel: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { UsersService } = jest.requireMock("../../../modules/users");
const { AgencyModel } = jest.requireMock("../../../modules/agencies/agencies.model");
const { requireAuth, clearUserCache } = jest.requireActual("../auth.middleware");

function mockAgencyFindOne(result: unknown) {
  AgencyModel.findOne.mockReturnValue({
    lean: jest.fn().mockResolvedValue(result),
  } as any);
}

function mockReq(auth?: { userId?: string }) {
  return {
    auth: () => auth || {},
    user: undefined,
  } as Request & { auth?: () => { userId?: string }; user?: Record<string, string> };
}

function mockRes() {
  const res: Partial<Response> = {};
  return res as Response;
}

describe("requireAuth middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearUserCache();
  });

  it("sets req.user when auth is valid and user exists", async () => {
    const req = mockReq({ userId: "clerk_123" });
    const res = mockRes();
    const next = jest.fn();

    UsersService.getByClerkId.mockResolvedValue({
      _id: { toString: () => "662a1f77bcf86cd799439011" },
      clerkId: "clerk_123",
      email: "user@test.com",
      role: "agent",
      agencyId: { toString: () => "662a1f77bcf86cd799439022" },
      isActive: true,
    });

    const middleware = requireAuth[1];
    await middleware(req, res, next);

    expect(req.user).toEqual({
      id: "662a1f77bcf86cd799439011",
      clerkId: "clerk_123",
      email: "user@test.com",
      role: "agent",
      agencyId: "662a1f77bcf86cd799439022",
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

  it("auto-creates user when db user is not found", async () => {
    const req = mockReq({ userId: "clerk_new" });
    const res = mockRes();
    const next = jest.fn();

    UsersService.getByClerkId.mockResolvedValue(null);
    mockAgencyFindOne({ _id: { toString: () => "662a1f77bcf86cd799439044" } });
    UsersService.create.mockResolvedValue({
      _id: { toString: () => "662a1f77bcf86cd799439033" },
      clerkId: "clerk_new",
      email: "auto@test.com",
      name: "Auto Created",
      role: "agent",
      agencyId: { toString: () => "662a1f77bcf86cd799439044" },
      isActive: true,
    });

    const middleware = requireAuth[1];
    await middleware(req, res, next);

    expect(UsersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clerkId: "clerk_new",
        email: "auto@test.com",
        name: "Auto Created",
        role: "agent",
        isActive: true,
      }),
    );
    expect(req.user).toEqual(
      expect.objectContaining({
        clerkId: "clerk_new",
        role: "agent",
      }),
    );
    expect(next).toHaveBeenCalledWith();
  });

  it("throws UnauthorizedError when db user is inactive", async () => {
    const req = mockReq({ userId: "clerk_123" });
    const res = mockRes();
    const next = jest.fn();

    UsersService.getByClerkId.mockResolvedValue({
      _id: { toString: () => "662a1f77bcf86cd799439011" },
      clerkId: "clerk_123",
      email: "user@test.com",
      role: "agent",
      agencyId: { toString: () => "662a1f77bcf86cd799439022" },
      isActive: false,
    });

    const middleware = requireAuth[1];
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("throws error when agencyId is missing", async () => {
    const req = mockReq({ userId: "clerk_123" });
    const res = mockRes();
    const next = jest.fn();

    UsersService.getByClerkId.mockResolvedValue({
      _id: { toString: () => "662a1f77bcf86cd799439011" },
      clerkId: "clerk_123",
      email: "user@test.com",
      role: "agent",
      agencyId: null,
      isActive: true,
    });

    const middleware = requireAuth[1];
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});
