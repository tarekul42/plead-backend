const mockQbExec = jest.fn();

const mockWhere = jest.fn().mockReturnThis();
const mockWhereBoolean = jest.fn().mockReturnThis();
const mockSortDesc = jest.fn().mockReturnThis();
const mockPaginate = jest.fn().mockReturnThis();

jest.mock("../../../core/utils/query-builder", () => ({
  QueryBuilder: jest.fn(() => ({
    where: mockWhere,
    whereBoolean: mockWhereBoolean,
    sortDesc: mockSortDesc,
    paginate: mockPaginate,
    exec: mockQbExec,
  })),
}));

jest.mock("../reviews.model", () => ({
  ReviewModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    create: jest.fn(),
  },
}));

import { ReviewsRepository } from "../reviews.repository";

describe("ReviewsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listByAgency", () => {
    it("delegates to QueryBuilder with agencyId + isVerified boolean", async () => {
      mockQbExec.mockResolvedValue({ data: [{ id: "1" }], total: 1 });

      const result = await ReviewsRepository.listByAgency("agency_1", "true");

      expect(mockWhere).toHaveBeenCalledWith("agencyId", "agency_1");
      expect(mockWhereBoolean).toHaveBeenCalledWith("isVerified", "true");
      expect(result).toEqual({ data: [{ id: "1" }], total: 1 });
    });

    it("handles undefined isVerified (skips whereBoolean)", async () => {
      mockQbExec.mockResolvedValue({ data: [], total: 0 });

      const result = await ReviewsRepository.listByAgency("agency_1");

      expect(mockWhereBoolean).toHaveBeenCalledWith("isVerified", undefined);
      expect(result).toEqual({ data: [], total: 0 });
    });

    it("returns paginated data", async () => {
      mockQbExec.mockResolvedValue({ data: [{ id: "2" }], total: 1 });

      const result = await ReviewsRepository.listByAgency("agency_1", undefined, 2, 25);

      expect(mockPaginate).toHaveBeenCalledWith(2, 25, 100, 50);
      expect(result).toEqual({ data: [{ id: "2" }], total: 1 });
    });
  });

  describe("listByProperty", () => {
    it("queries with propertyId + agencyId via QueryBuilder", async () => {
      mockQbExec.mockResolvedValue({ data: [{ id: "1" }], total: 1 });

      const result = await ReviewsRepository.listByProperty("prop_1", "agency_1");

      expect(mockWhere).toHaveBeenCalledWith("propertyId", "prop_1");
      expect(mockWhere).toHaveBeenCalledWith("agencyId", "agency_1");
      expect(result).toEqual({ data: [{ id: "1" }], total: 1 });
    });
  });

  describe("findById", () => {
    it("queries with _id + agencyId + lean", async () => {
      const doc = { _id: "abc", agencyId: "agency_1", rating: 5 };
      (jest.requireMock("../reviews.model").ReviewModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      const result = await ReviewsRepository.findById("abc", "agency_1");

      expect(result).toEqual(doc);
    });

    it("returns null", async () => {
      (jest.requireMock("../reviews.model").ReviewModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await ReviewsRepository.findById("nonexistent", "agency_1");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("calls ReviewModel.create", async () => {
      const data = { rating: 5, agencyId: "agency_1" };
      (jest.requireMock("../reviews.model").ReviewModel.create as jest.Mock).mockResolvedValue(
        data,
      );

      const result = await ReviewsRepository.create(data as any);

      expect(result).toEqual(data);
    });
  });

  describe("update", () => {
    it("calls findOneAndUpdate with { new: true }", async () => {
      const updated = { _id: "abc", agencyId: "agency_1", rating: 4 };
      (
        jest.requireMock("../reviews.model").ReviewModel.findOneAndUpdate as jest.Mock
      ).mockResolvedValue(updated);

      const result = await ReviewsRepository.update("abc", "agency_1", { rating: 4 } as any);

      expect(result).toEqual(updated);
    });

    it("returns null", async () => {
      (
        jest.requireMock("../reviews.model").ReviewModel.findOneAndUpdate as jest.Mock
      ).mockResolvedValue(null);

      const result = await ReviewsRepository.update("nonexistent", "agency_1", {
        rating: 4,
      } as any);

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("returns true when deleted", async () => {
      (jest.requireMock("../reviews.model").ReviewModel.deleteOne as jest.Mock).mockResolvedValue({
        deletedCount: 1,
      });

      const result = await ReviewsRepository.delete("abc", "agency_1");

      expect(result).toBe(true);
    });

    it("returns false when nothing deleted", async () => {
      (jest.requireMock("../reviews.model").ReviewModel.deleteOne as jest.Mock).mockResolvedValue({
        deletedCount: 0,
      });

      const result = await ReviewsRepository.delete("nonexistent", "agency_1");

      expect(result).toBe(false);
    });
  });
});
