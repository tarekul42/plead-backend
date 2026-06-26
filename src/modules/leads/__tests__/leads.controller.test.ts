import { Request, Response } from "express";

jest.mock("../leads.service", () => ({
  LeadsService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../leads.repository", () => ({}));
jest.mock("../leads.model", () => ({}));

import { LeadsController } from "../leads.controller";

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: { id: "user_1", agencyId: "agency_1", role: "admin", clerkId: "clerk_1", email: "a@b.com" },
    params: {}, query: {}, body: {},
    ...overrides,
  } as Request;
}
function mockRes() {
  const res: Partial<Response> = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("LeadsController", () => {
  let svc: Record<string, jest.Mock>;
  beforeEach(() => {
    svc = jest.requireMock("../leads.service").LeadsService;
    jest.clearAllMocks();
  });

  it("list returns paginated leads", async () => {
    const req = mockReq({ query: { page: "1", limit: "20" } });
    const res = mockRes(); const next = jest.fn();
    svc.list.mockResolvedValue({ data: [{ id: "l1" }], total: 1 });

    await LeadsController.list(req, res, next);
    expect(svc.list).toHaveBeenCalledWith(expect.any(Object), "agency_1");
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("list scopes to agent when role is agent", async () => {
    const req = mockReq({ user: { ...mockReq().user!, role: "agent" }, query: { page: "1" } });
    const res = mockRes(); const next = jest.fn();
    svc.list.mockResolvedValue({ data: [], total: 0 });

    await LeadsController.list(req, res, next);
    expect(svc.list).toHaveBeenCalledWith(expect.objectContaining({ assignedAgentId: "user_1" }), "agency_1");
  });

  it("getById throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.getById.mockResolvedValue(null);

    await LeadsController.getById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("create returns 201", async () => {
    const req = mockReq({ body: { name: "Lead" } });
    const res = mockRes(); const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });

    await LeadsController.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("create spreads req.body with agencyId from req.user", async () => {
    const req = mockReq({ body: { name: "Lead", email: "a@b.com" } });
    const res = mockRes(); const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });

    await LeadsController.create(req, res, next);
    expect(svc.create).toHaveBeenCalledWith({ name: "Lead", email: "a@b.com", agencyId: "agency_1" });
  });

  it("update throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" }, body: { name: "Updated" } });
    const res = mockRes(); const next = jest.fn();
    svc.update.mockResolvedValue(null);

    await LeadsController.update(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("delete throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.delete.mockResolvedValue(false);

    await LeadsController.delete(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });
});
