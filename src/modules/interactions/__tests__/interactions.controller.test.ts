import { Request, Response } from "express";

jest.mock("../interactions.service", () => ({
  InteractionsService: {
    listByAgency: jest.fn(),
    listByUser: jest.fn(),
    listByLead: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../interactions.repository", () => ({}));
jest.mock("../interactions.model", () => ({}));
jest.mock("../../leads/leads.model", () => ({}));

import { InteractionsController } from "../interactions.controller";

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

describe("InteractionsController", () => {
  let svc: Record<string, jest.Mock>;
  beforeEach(() => {
    svc = jest.requireMock("../interactions.service").InteractionsService;
    jest.clearAllMocks();
  });

  it("list uses listByAgency for non-agent", async () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();
    svc.listByAgency.mockResolvedValue({ data: [], total: 0 });
    await InteractionsController.list(req, res, next);
    expect(svc.listByAgency).toHaveBeenCalledWith(
      "agency_1",
      1,
      50,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  });

  it("list uses listByUser for agent role", async () => {
    const req = mockReq({ user: { ...mockReq().user!, role: "agent" } });
    const res = mockRes();
    const next = jest.fn();
    svc.listByUser.mockResolvedValue({ data: [], total: 0 });
    await InteractionsController.list(req, res, next);
    expect(svc.listByUser).toHaveBeenCalledWith(
      "user_1",
      "agency_1",
      1,
      50,
      undefined,
      undefined,
      undefined,
    );
  });

  it("listByLead returns paginated interactions", async () => {
    const req = mockReq({ params: { leadId: "lead_1" } });
    const res = mockRes();
    const next = jest.fn();
    svc.listByLead.mockResolvedValue({ data: [{ id: "i1" }], total: 1 });
    await InteractionsController.listByLead(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("create returns 201", async () => {
    const req = mockReq({ params: { leadId: "lead_1" }, body: { type: "call" } });
    const res = mockRes();
    const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });
    await InteractionsController.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("create spreads leadId from params and userId/agencyId from req.user", async () => {
    const req = mockReq({ params: { leadId: "lead_1" }, body: { type: "call" } });
    const res = mockRes();
    const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });

    await InteractionsController.create(req, res, next);
    expect(svc.create).toHaveBeenCalledWith({
      type: "call",
      leadId: "lead_1",
      agencyId: "agency_1",
      performedById: "user_1",
    });
  });

  it("update works successfully", async () => {
    const req = mockReq({ params: { id: "abc" }, body: { type: "email" } });
    const res = mockRes();
    const next = jest.fn();
    svc.update.mockResolvedValue({ _id: "abc", type: "email" });

    await InteractionsController.update(req, res, next);
    expect(svc.update).toHaveBeenCalledWith("abc", "agency_1", "user_1", "admin", {
      type: "email",
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("delete returns success", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes();
    const next = jest.fn();
    svc.delete.mockResolvedValue(true);

    await InteractionsController.delete(req, res, next);
    expect(svc.delete).toHaveBeenCalledWith("abc", "agency_1", "user_1", "admin");
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("delete throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes();
    const next = jest.fn();
    svc.delete.mockResolvedValue(false);
    await InteractionsController.delete(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });
});
