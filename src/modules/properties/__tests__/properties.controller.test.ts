import { Request, Response, NextFunction } from "express";

jest.mock("../properties.service", () => ({
  PropertiesService: {
    list: jest.fn(),
    getById: jest.fn(),
    getBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getRelated: jest.fn(),
  },
}));

jest.mock("../properties.repository", () => ({}));
jest.mock("../properties.model", () => ({}));
jest.mock("../../reviews/reviews.model", () => ({}));

import { PropertiesController } from "../properties.controller";

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

describe("PropertiesController", () => {
  let svc: Record<string, jest.Mock>;
  beforeEach(() => {
    svc = jest.requireMock("../properties.service").PropertiesService;
    jest.clearAllMocks();
  });

  it("list returns paginated properties", async () => {
    const req = mockReq({ query: { page: "1", limit: "12" } });
    const res = mockRes(); const next = jest.fn();
    svc.list.mockResolvedValue({ data: [{ id: "p1" }], total: 1 });

    await PropertiesController.list(req, res, next);
    expect(svc.list).toHaveBeenCalledWith(expect.any(Object), "agency_1");
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("getById returns property", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.getById.mockResolvedValue({ _id: "abc" });

    await PropertiesController.getById(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("getById throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.getById.mockResolvedValue(null);

    await PropertiesController.getById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("create returns 201", async () => {
    const req = mockReq({ body: { title: "House" } });
    const res = mockRes(); const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });

    await PropertiesController.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("update throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" }, body: { price: 1 } });
    const res = mockRes(); const next = jest.fn();
    svc.update.mockResolvedValue(null);

    await PropertiesController.update(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("create spreads req.body with agencyId from req.user", async () => {
    const req = mockReq({ body: { title: "House", price: 100000 } });
    const res = mockRes(); const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });

    await PropertiesController.create(req, res, next);
    expect(svc.create).toHaveBeenCalledWith({ title: "House", price: 100000, agencyId: "agency_1" });
  });

  it("getBySlug returns property", async () => {
    const req = mockReq({ params: { slug: "my-house" } });
    const res = mockRes(); const next = jest.fn();
    svc.getBySlug.mockResolvedValue({ slug: "my-house" });

    await PropertiesController.getBySlug(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("getBySlug throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { slug: "my-house" } });
    const res = mockRes(); const next = jest.fn();
    svc.getBySlug.mockResolvedValue(null);

    await PropertiesController.getBySlug(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("delete throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.delete.mockResolvedValue(false);

    await PropertiesController.delete(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("related returns related properties", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.getRelated.mockResolvedValue([{ id: "r1" }]);

    await PropertiesController.related(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
