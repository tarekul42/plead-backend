import { Request, Response } from "express";

jest.mock("../reviews.service", () => ({
  ReviewsService: {
    listByAgency: jest.fn(),
    listByProperty: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../reviews.repository", () => ({}));
jest.mock("../reviews.model", () => ({}));

import { ReviewsController } from "../reviews.controller";

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

describe("ReviewsController", () => {
  let svc: Record<string, jest.Mock>;
  beforeEach(() => {
    svc = jest.requireMock("../reviews.service").ReviewsService;
    jest.clearAllMocks();
  });

  it("list returns paginated reviews", async () => {
    const req = mockReq(); const res = mockRes(); const next = jest.fn();
    svc.listByAgency.mockResolvedValue({ data: [], total: 0 });
    await ReviewsController.list(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("listByProperty returns reviews", async () => {
    const req = mockReq({ params: { propertyId: "prop_1" } });
    const res = mockRes(); const next = jest.fn();
    svc.listByProperty.mockResolvedValue({ data: [{ id: "r1" }], total: 1 });
    await ReviewsController.listByProperty(req, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("create returns 201", async () => {
    const req = mockReq({ params: { propertyId: "prop_1" }, body: { rating: 5 } });
    const res = mockRes(); const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });
    await ReviewsController.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("create spreads userId and propertyId from req", async () => {
    const req = mockReq({ params: { propertyId: "prop_1" }, body: { rating: 5, comment: "Great" } });
    const res = mockRes(); const next = jest.fn();
    svc.create.mockResolvedValue({ id: "new" });

    await ReviewsController.create(req, res, next);
    expect(svc.create).toHaveBeenCalledWith({
      rating: 5,
      comment: "Great",
      propertyId: "prop_1",
      agencyId: "agency_1",
      userId: "user_1",
    });
  });

  it("update works successfully", async () => {
    const req = mockReq({ params: { id: "abc" }, body: { rating: 4 } });
    const res = mockRes(); const next = jest.fn();
    svc.update.mockResolvedValue({ _id: "abc", rating: 4 });

    await ReviewsController.update(req, res, next);
    expect(svc.update).toHaveBeenCalledWith("abc", "agency_1", { rating: 4 });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("delete throws NotFoundError when missing", async () => {
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes(); const next = jest.fn();
    svc.delete.mockResolvedValue(false);
    await ReviewsController.delete(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });
});
