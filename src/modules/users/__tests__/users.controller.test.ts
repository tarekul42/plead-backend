import { UsersController } from "../users.controller";
import { UsersService } from "../users.service";
import { AppError } from "../../../core/utils/app-error";

jest.mock("../users.service");

const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  clerkId: "clerk_123",
  email: "john@example.com",
  name: "John Doe",
  role: "agent",
  agencyId: "507f1f77bcf86cd799439012",
  isActive: true,
};

function mockRes() {
  const res: Record<string, jest.Mock> = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res as unknown as import("express").Response;
}

function mockReq(overrides: Record<string, unknown> = {}) {
  return {
    params: {},
    query: {},
    body: {},
    user: { id: "507f1f77bcf86cd799439011", agencyId: "507f1f77bcf86cd799439012" },
    ...overrides,
  } as unknown as import("express").Request;
}

describe("UsersController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should return paginated users for the agency", async () => {
      const listResult = { data: [mockUser], total: 1 };
      (UsersService.listByAgency as jest.Mock).mockResolvedValue(listResult);

      const req = mockReq({ query: { page: "1", limit: "50" } });
      const res = mockRes();
      const next = jest.fn();

      await UsersController.list(req, res, next);

      expect(UsersService.listByAgency).toHaveBeenCalledWith("507f1f77bcf86cd799439012", 1, 50);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [mockUser],
          meta: expect.objectContaining({ page: 1, limit: 50, total: 1 }),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getMe", () => {
    it("should return the current user", async () => {
      (UsersService.getById as jest.Mock).mockResolvedValue(mockUser);

      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      await UsersController.getMe(req, res, next);

      expect(UsersService.getById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockUser }),
      );
    });
  });

  describe("getById", () => {
    it("should return user if same agency", async () => {
      (UsersService.getById as jest.Mock).mockResolvedValue(mockUser);

      const req = mockReq({ params: { id: "507f1f77bcf86cd799439011" } });
      const res = mockRes();
      const next = jest.fn();

      await UsersController.getById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockUser }),
      );
    });

    it("should throw NotFoundError if user not found", async () => {
      (UsersService.getById as jest.Mock).mockResolvedValue(null);

      const req = mockReq({ params: { id: "nonexistent" } });
      const res = mockRes();
      const next = jest.fn();

      await UsersController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });

    it("should throw NotFoundError if user belongs to different agency", async () => {
      (UsersService.getById as jest.Mock).mockResolvedValue({
        ...mockUser,
        agencyId: "507f1f77bcf86cd799439099",
      });

      const req = mockReq({ params: { id: "507f1f77bcf86cd799439011" } });
      const res = mockRes();
      const next = jest.fn();

      await UsersController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe("update", () => {
    it("should update and return user", async () => {
      const updated = { ...mockUser, title: "Senior Agent" };
      (UsersService.updateById as jest.Mock).mockResolvedValue(updated);

      const req = mockReq({ params: { id: "507f1f77bcf86cd799439011" }, body: { title: "Senior Agent" } });
      const res = mockRes();
      const next = jest.fn();

      await UsersController.update(req, res, next);

      expect(UsersService.updateById).toHaveBeenCalledWith("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", { title: "Senior Agent" });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: updated }),
      );
    });

    it("should throw NotFoundError if update returns null", async () => {
      (UsersService.updateById as jest.Mock).mockResolvedValue(null);

      const req = mockReq({ params: { id: "nonexistent" }, body: { title: "Senior Agent" } });
      const res = mockRes();
      const next = jest.fn();

      await UsersController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe("delete", () => {
    it("should soft-delete user by setting isActive to false", async () => {
      (UsersService.getById as jest.Mock).mockResolvedValue(mockUser);
      (UsersService.update as jest.Mock).mockResolvedValue({ ...mockUser, isActive: false });

      const req = mockReq({ params: { id: "507f1f77bcf86cd799439011" } });
      const res = mockRes();
      const next = jest.fn();

      await UsersController.delete(req, res, next);

      expect(UsersService.update).toHaveBeenCalledWith("clerk_123", { isActive: false });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: { deleted: true } }),
      );
    });

    it("should throw NotFoundError if user not found", async () => {
      (UsersService.getById as jest.Mock).mockResolvedValue(null);

      const req = mockReq({ params: { id: "nonexistent" } });
      const res = mockRes();
      const next = jest.fn();

      await UsersController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });

    it("should throw NotFoundError if user belongs to different agency", async () => {
      (UsersService.getById as jest.Mock).mockResolvedValue({
        ...mockUser,
        agencyId: "507f1f77bcf86cd799439099",
      });

      const req = mockReq({ params: { id: "507f1f77bcf86cd799439011" } });
      const res = mockRes();
      const next = jest.fn();

      await UsersController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(404);
    });
  });
});
