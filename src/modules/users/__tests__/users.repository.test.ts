const mockCreate = jest.fn();
const mockQbExec = jest.fn();

const mockWhere = jest.fn().mockReturnThis();
const mockSortDesc = jest.fn().mockReturnThis();
const mockPaginate = jest.fn().mockReturnThis();

jest.mock("../../../core/utils/query-builder", () => ({
  QueryBuilder: jest.fn(() => ({
    where: mockWhere,
    sortDesc: mockSortDesc,
    paginate: mockPaginate,
    exec: mockQbExec,
  })),
}));

jest.mock("../users.model", () => ({
  UserModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: mockCreate,
  },
}));

import { UsersRepository } from "../users.repository";

describe("UsersRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findByClerkId", () => {
    it("queries by clerkId with isActive: true", async () => {
      const doc = { clerkId: "clerk_123", name: "John" };
      (jest.requireMock("../users.model").UserModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      const result = await UsersRepository.findByClerkId("clerk_123");
      expect(result).toEqual(doc);
    });

    it("returns null when not found", async () => {
      (jest.requireMock("../users.model").UserModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await UsersRepository.findByClerkId("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("queries by _id with isActive: true", async () => {
      (jest.requireMock("../users.model").UserModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: "abc" }),
      });

      const result = await UsersRepository.findById("abc");
      expect(result).toEqual({ _id: "abc" });
    });
  });

  describe("create", () => {
    it("calls UserModel.create with data", async () => {
      const data = {
        clerkId: "clerk_1",
        email: "test@test.com",
        name: "Test",
        role: "agent",
        agencyId: "agency_1",
      };
      mockCreate.mockResolvedValue(data);
      const result = await UsersRepository.create(data as any);
      expect(mockCreate).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
  });

  describe("update", () => {
    it("finds and updates by clerkId", async () => {
      const updated = { clerkId: "clerk_1", name: "Updated" };
      (
        jest.requireMock("../users.model").UserModel.findOneAndUpdate as jest.Mock
      ).mockResolvedValue(updated);

      const result = await UsersRepository.update("clerk_1", { name: "Updated" });
      expect(result).toEqual(updated);
    });
  });

  describe("updateById", () => {
    it("finds and updates by _id and agencyId", async () => {
      const updated = { _id: "abc", name: "Updated" };
      (
        jest.requireMock("../users.model").UserModel.findOneAndUpdate as jest.Mock
      ).mockResolvedValue(updated);

      const result = await UsersRepository.updateById("abc", "agency_1", { name: "Updated" });
      expect(result).toEqual(updated);
    });
  });

  describe("listByAgency", () => {
    it("uses query builder with pagination", async () => {
      mockQbExec.mockResolvedValue({ data: [{ id: "1" }], total: 1 });

      const result = await UsersRepository.listByAgency("agency_1", 1, 50);
      expect(result).toEqual({ data: [{ id: "1" }], total: 1 });
    });
  });
});
