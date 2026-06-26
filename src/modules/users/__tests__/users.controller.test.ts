import { Request, Response } from "express";
import { UsersController } from "../users.controller";

jest.mock("../users.service", () => ({
  UsersService: {
    getById: jest.fn(),
    listByAgency: jest.fn(),
    updateById: jest.fn(),
    update: jest.fn(),
  },
}));

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: { id: "user_1", agencyId: "agency_1", role: "admin", clerkId: "clerk_1", email: "a@b.com" },
    params: {},
    query: {},
    body: {},
    ...overrides,
  } as Request;
}

function mockRes() {
  const res: Partial<Response> = {};
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("UsersController", () => {
  let mockService: Record<string, jest.Mock>;

  beforeEach(() => {
    mockService = jest.requireMock("../users.service").UsersService;
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("returns paginated users list", async () => {
      const req = mockReq({ query: { page: "1", limit: "10" } });
      const res = mockRes();
      const next = jest.fn();

      mockService.listByAgency.mockResolvedValue({ data: [{ id: "1", name: "John" }], total: 1 });

      await UsersController.list(req, res, next);

      expect(mockService.listByAgency).toHaveBeenCalledWith("agency_1", 1, 10);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [{ id: "1", name: "John" }],
          meta: expect.objectContaining({ page: 1, limit: 10, total: 1 }),
        }),
      );
    });
  });

  describe("getMe", () => {
    it("returns current user", async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockService.getById.mockResolvedValue({ id: "user_1", name: "John" });

      await UsersController.getMe(req, res, next);

      expect(mockService.getById).toHaveBeenCalledWith("user_1");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: { id: "user_1", name: "John" } }),
      );
    });
  });

  describe("getById", () => {
    it("returns user by id", async () => {
      const req = mockReq({ params: { id: "abc" } });
      const res = mockRes();
      const next = jest.fn();

      mockService.getById.mockResolvedValue({ _id: "abc", agencyId: "agency_1" });

      await UsersController.getById(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("calls next with error when user not in agency", async () => {
      const req = mockReq({ params: { id: "abc" } });
      const res = mockRes();
      const next = jest.fn();

      mockService.getById.mockResolvedValue({ _id: "abc", agencyId: "other_agency" });

      await UsersController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });

  describe("update", () => {
    it("updates user and returns it", async () => {
      const req = mockReq({ params: { id: "abc" }, body: { name: "Updated" } });
      const res = mockRes();
      const next = jest.fn();

      mockService.updateById.mockResolvedValue({ _id: "abc", name: "Updated" });

      await UsersController.update(req, res, next);

      expect(mockService.updateById).toHaveBeenCalledWith("abc", "agency_1", { name: "Updated" });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("calls next with error when update returns null", async () => {
      const req = mockReq({ params: { id: "abc" } });
      const res = mockRes();
      const next = jest.fn();

      mockService.updateById.mockResolvedValue(null);

      await UsersController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });

  describe("delete", () => {
    it("deactivates user", async () => {
      const req = mockReq({ params: { id: "abc" } });
      const res = mockRes();
      const next = jest.fn();

      mockService.getById.mockResolvedValue({ _id: "abc", agencyId: "agency_1", clerkId: "clerk_abc" });
      mockService.update.mockResolvedValue({ _id: "abc", isActive: false });

      await UsersController.delete(req, res, next);

      expect(mockService.getById).toHaveBeenCalledWith("abc");
      expect(mockService.update).toHaveBeenCalledWith("clerk_abc", { isActive: false });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("calls next with error when user not found", async () => {
      const req = mockReq({ params: { id: "abc" } });
      const res = mockRes();
      const next = jest.fn();

      mockService.getById.mockResolvedValue(null);

      await UsersController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it("calls next with error when user not in agency", async () => {
      const req = mockReq({ params: { id: "abc" } });
      const res = mockRes();
      const next = jest.fn();

      mockService.getById.mockResolvedValue({ _id: "abc", agencyId: "other_agency" });

      await UsersController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });
});
