const mockFindByClerkId = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockUpdateById = jest.fn();
const mockListByAgency = jest.fn();

jest.mock("../users.repository", () => ({
  UsersRepository: {
    findByClerkId: mockFindByClerkId,
    findById: mockFindById,
    create: mockCreate,
    update: mockUpdate,
    updateById: mockUpdateById,
    listByAgency: mockListByAgency,
  },
}));

import { UsersService } from "../users.service";

describe("UsersService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getByClerkId", () => {
    it("delegates to repository", async () => {
      const user = { clerkId: "clerk_1", name: "John" };
      mockFindByClerkId.mockResolvedValue(user);
      const result = await UsersService.getByClerkId("clerk_1");
      expect(mockFindByClerkId).toHaveBeenCalledWith("clerk_1");
      expect(result).toEqual(user);
    });
  });

  describe("getById", () => {
    it("delegates to repository", async () => {
      mockFindById.mockResolvedValue({ _id: "abc" });
      const result = await UsersService.getById("abc");
      expect(mockFindById).toHaveBeenCalledWith("abc");
      expect(result).toEqual({ _id: "abc" });
    });
  });

  describe("create", () => {
    it("delegates to repository", async () => {
      const data = { clerkId: "clerk_1", email: "a@b.com", name: "A", role: "agent" as const, agencyId: "ag_1" as any };
      mockCreate.mockResolvedValue(data);
      const result = await UsersService.create(data as any);
      expect(mockCreate).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
  });

  describe("update", () => {
    it("delegates to repository", async () => {
      mockUpdate.mockResolvedValue({ clerkId: "clerk_1" });
      await UsersService.update("clerk_1", { name: "Updated" });
      expect(mockUpdate).toHaveBeenCalledWith("clerk_1", { name: "Updated" });
    });
  });

  describe("updateById", () => {
    it("delegates to repository with agency scope", async () => {
      mockUpdateById.mockResolvedValue({ _id: "abc" });
      await UsersService.updateById("abc", "agency_1", { name: "Updated" });
      expect(mockUpdateById).toHaveBeenCalledWith("abc", "agency_1", { name: "Updated" });
    });
  });

  describe("listByAgency", () => {
    it("delegates to repository", async () => {
      mockListByAgency.mockResolvedValue({ data: [], total: 0 });
      const result = await UsersService.listByAgency("agency_1", 1, 50);
      expect(mockListByAgency).toHaveBeenCalledWith("agency_1", 1, 50);
      expect(result).toEqual({ data: [], total: 0 });
    });
  });
});
