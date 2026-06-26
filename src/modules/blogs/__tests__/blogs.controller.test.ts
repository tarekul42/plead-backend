import { Request, Response } from "express";

jest.mock("../blogs.service", () => ({
  BlogsService: {
    list: jest.fn(),
    getById: jest.fn(),
    getBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../blogs.repository", () => ({}));
jest.mock("../blogs.model", () => ({}));

import { BlogsController } from "../blogs.controller";

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

describe("BlogsController", () => {
  let svc: Record<string, jest.Mock>;
  beforeEach(() => {
    svc = jest.requireMock("../blogs.service").BlogsService;
    jest.clearAllMocks();
  });

  it("list returns paginated blogs", async () => {
    const req = mockReq(); const res = mockRes(); const next = jest.fn();
    svc.list.mockResolvedValue({ data: [{ id: "b1" }], total: 1 });
    await BlogsController.list(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("getBySlug returns blog", async () => {
    const req = mockReq({ params: { slug: "my-post" } });
    const res = mockRes(); const next = jest.fn();
    svc.getBySlug.mockResolvedValue({ slug: "my-post" });
    await BlogsController.getBySlug(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("getBySlug throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { slug: "my-post" } });
    const res = mockRes(); const next = jest.fn();
    svc.getBySlug.mockResolvedValue(null);
    await BlogsController.getBySlug(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("getById throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.getById.mockResolvedValue(null);
    await BlogsController.getById(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it("create returns 201", async () => {
    const req = mockReq({ body: { title: "Post" } });
    const res = mockRes(); const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });
    await BlogsController.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("create spreads authorId from req.user", async () => {
    const req = mockReq({ body: { title: "Post", content: "..." } });
    const res = mockRes(); const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });

    await BlogsController.create(req, res, next);
    expect(svc.create).toHaveBeenCalledWith({
      title: "Post",
      content: "...",
      agencyId: "agency_1",
      authorId: "user_1",
    });
  });

  it("update works successfully", async () => {
    const req = mockReq({ params: { id: "abc" }, body: { title: "Updated" } });
    const res = mockRes(); const next = jest.fn();
    svc.update.mockResolvedValue({ _id: "abc", title: "Updated" });

    await BlogsController.update(req, res, next);
    expect(svc.update).toHaveBeenCalledWith("abc", "agency_1", { title: "Updated" });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("delete throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.delete.mockResolvedValue(false);
    await BlogsController.delete(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });
});
