import { Request, Response } from "express";

jest.mock("../agencies.service", () => ({
  AgenciesService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../agencies.repository", () => ({}));
jest.mock("../agencies.model", () => ({}));

import { AgenciesController } from "../agencies.controller";

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

describe("AgenciesController", () => {
  let svc: Record<string, jest.Mock>;
  beforeEach(() => {
    svc = jest.requireMock("../agencies.service").AgenciesService;
    jest.clearAllMocks();
  });

  it("list returns agencies with pagination meta", async () => {
    const req = mockReq({ query: { page: "1", limit: "20" } });
    const res = mockRes(); const next = jest.fn();
    svc.list.mockResolvedValue({ data: [{ id: "a1" }], total: 1 });

    await AgenciesController.list(req, res, next);
    expect(svc.list).toHaveBeenCalledWith("agency_1", 1, 20);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("create returns 201 with agency", async () => {
    const req = mockReq({ body: { name: "Agency" } });
    const res = mockRes(); const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });

    await AgenciesController.create(req, res, next);
    expect(svc.create).toHaveBeenCalledWith({ name: "Agency" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("getById returns agency", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.getById.mockResolvedValue({ _id: "abc" });

    await AgenciesController.getById(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("getById throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.getById.mockResolvedValue(null);

    await AgenciesController.getById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("update returns updated agency", async () => {
    const req = mockReq({ params: { id: "abc" }, body: { name: "Updated" } });
    const res = mockRes(); const next = jest.fn();
    svc.update.mockResolvedValue({ _id: "abc", name: "Updated" });

    await AgenciesController.update(req, res, next);
    expect(svc.update).toHaveBeenCalledWith("abc", "agency_1", { name: "Updated" });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("update throws NotFoundError when null", async () => {
    const req = mockReq({ params: { id: "abc" }, body: { name: "Updated" } });
    const res = mockRes(); const next = jest.fn();
    svc.update.mockResolvedValue(null);

    await AgenciesController.update(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("delete returns success", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.delete.mockResolvedValue(true);

    await AgenciesController.delete(req, res, next);
    expect(svc.delete).toHaveBeenCalledWith("abc", "agency_1");
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("delete throws NotFoundError when false", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.delete.mockResolvedValue(false);

    await AgenciesController.delete(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });
});
