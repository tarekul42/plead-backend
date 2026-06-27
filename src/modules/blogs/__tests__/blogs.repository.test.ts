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

jest.mock("../blogs.model", () => ({
  BlogModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../users/users.model", () => ({
  UserModel: {
    find: jest.fn(() => ({ select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([]) })) })),
    findById: jest.fn(() => ({ select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(null) })) })),
  },
}));

import { BlogsRepository } from "../blogs.repository";

describe("BlogsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("delegates to QueryBuilder with agencyId + status", async () => {
      mockQbExec.mockResolvedValue({ data: [{ id: "1" }], total: 1 });

      const result = await BlogsRepository.list("agency_1", "published");

      expect(mockWhere).toHaveBeenCalledWith("agencyId", "agency_1");
      expect(mockWhere).toHaveBeenCalledWith("status", "published");
      expect(result.data).toEqual([{ id: "1", author: null }]);
      expect(result.total).toBe(1);
    });

    it("handles undefined status (skips where)", async () => {
      mockQbExec.mockResolvedValue({ data: [], total: 0 });

      const result = await BlogsRepository.list("agency_1");

      expect(mockWhere).toHaveBeenCalledWith("agencyId", "agency_1");
      expect(mockWhere).toHaveBeenCalledWith("status", undefined);
      expect(result).toEqual({ data: [], total: 0 });
    });

    it("returns paginated data", async () => {
      mockQbExec.mockResolvedValue({ data: [{ id: "2" }], total: 1 });

      const result = await BlogsRepository.list("agency_1", undefined, 2, 10);

      expect(mockPaginate).toHaveBeenCalledWith(2, 10, 100, 10);
      expect(result.data).toEqual([{ id: "2", author: null }]);
      expect(result.total).toBe(1);
    });
  });

  describe("findBySlug", () => {
    it("queries with slug + agencyId + lean", async () => {
      const doc = { slug: "hello-world", agencyId: "agency_1", title: "Hello" };
      (jest.requireMock("../blogs.model").BlogModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      const result = await BlogsRepository.findBySlug("hello-world", "agency_1");

      expect(result).toEqual({ ...doc, author: null });
    });
  });

  describe("findById", () => {
    it("queries with _id + agencyId + lean", async () => {
      const doc = { _id: "abc", agencyId: "agency_1", title: "Post" };
      (jest.requireMock("../blogs.model").BlogModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      const result = await BlogsRepository.findById("abc", "agency_1");

      expect(result).toEqual({ ...doc, author: null });
    });

    it("returns null", async () => {
      (jest.requireMock("../blogs.model").BlogModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await BlogsRepository.findById("nonexistent", "agency_1");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("calls BlogModel.create", async () => {
      const data = { title: "New Post", agencyId: "agency_1" };
      (jest.requireMock("../blogs.model").BlogModel.create as jest.Mock).mockResolvedValue(data);

      const result = await BlogsRepository.create(data as any);

      expect(result).toEqual(data);
    });
  });

  describe("update", () => {
    it("calls findOneAndUpdate with { new: true }", async () => {
      const updated = { _id: "abc", agencyId: "agency_1", title: "Updated" };
      (jest.requireMock("../blogs.model").BlogModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updated);

      const result = await BlogsRepository.update("abc", "agency_1", { title: "Updated" } as any);

      expect(result).toEqual(updated);
    });

    it("returns null", async () => {
      (jest.requireMock("../blogs.model").BlogModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await BlogsRepository.update("nonexistent", "agency_1", { title: "Updated" } as any);

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("returns true when deleted", async () => {
      (jest.requireMock("../blogs.model").BlogModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const result = await BlogsRepository.delete("abc", "agency_1");

      expect(result).toBe(true);
    });

    it("returns false when nothing deleted", async () => {
      (jest.requireMock("../blogs.model").BlogModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const result = await BlogsRepository.delete("nonexistent", "agency_1");

      expect(result).toBe(false);
    });
  });
});
