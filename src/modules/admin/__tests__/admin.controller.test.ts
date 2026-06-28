import { Request, Response } from "express";

jest.mock("../admin.service", () => ({
  AdminService: {
    getAgencyStats: jest.fn(),
    listUsers: jest.fn(),
    toggleUserStatus: jest.fn(),
    getRecentAiAnalytics: jest.fn(),
  },
}));

import { AdminController } from "../admin.controller";

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: {
      id: "user_1",
      agencyId: "agency_1",
      role: "admin",
      clerkId: "clerk_1",
      email: "a@b.com",
    },
    params: {},
    query: {},
    body: {},
    ...overrides,
  } as Request;
}
function mockRes() {
  const res: Partial<Response> = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("AdminController", () => {
  let svc: Record<string, jest.Mock>;
  beforeEach(() => {
    svc = jest.requireMock("../admin.service").AdminService;
    jest.clearAllMocks();
  });

  it("getAgencyStats returns stats", async () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();
    svc.getAgencyStats.mockResolvedValue({ totalUsers: 5 });
    await AdminController.getAgencyStats(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("listUsers returns paginated list", async () => {
    const req = mockReq({ query: { page: "1", limit: "50" } });
    const res = mockRes();
    const next = jest.fn();
    svc.listUsers.mockResolvedValue({ data: [], total: 0 });
    await AdminController.listUsers(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("toggleUserStatus returns 400 for self-deactivation", async () => {
    const req = mockReq({ params: { id: "user_1" } });
    const res = mockRes();
    const next = jest.fn();
    await AdminController.toggleUserStatus(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "SELF_DEACTIVATE" }),
      }),
    );
  });

  it("toggleUserStatus returns 404 when user not found", async () => {
    const req = mockReq({ params: { id: "other_user" } });
    const res = mockRes();
    const next = jest.fn();
    svc.toggleUserStatus.mockResolvedValue(null);
    await AdminController.toggleUserStatus(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("toggleUserStatus toggles other user", async () => {
    const req = mockReq({ params: { id: "other_user" } });
    const res = mockRes();
    const next = jest.fn();
    svc.toggleUserStatus.mockResolvedValue({ _id: "other_user", isActive: false });
    await AdminController.toggleUserStatus(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("getAiAnalytics returns analytics", async () => {
    const req = mockReq({ query: { limit: "10" } });
    const res = mockRes();
    const next = jest.fn();
    svc.getRecentAiAnalytics.mockResolvedValue([]);
    await AdminController.getAiAnalytics(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
