const mockQbExec = jest.fn();

const mockWhere = jest.fn().mockReturnThis();
const mockWhereTextSearch = jest.fn().mockReturnThis();
const mockWhereRegex = jest.fn().mockReturnThis();
const mockWhereRange = jest.fn().mockReturnThis();
const mockSortBy = jest.fn().mockReturnThis();
const mockPaginate = jest.fn().mockReturnThis();

jest.mock("../../../core/utils/query-builder", () => ({
  QueryBuilder: jest.fn(() => ({
    where: mockWhere,
    whereTextSearch: mockWhereTextSearch,
    whereRegex: mockWhereRegex,
    whereRange: mockWhereRange,
    sortBy: mockSortBy,
    paginate: mockPaginate,
    exec: mockQbExec,
  })),
}));

jest.mock("../properties.model", () => ({
  PropertyModel: {
    findOne: jest.fn(() => ({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    })),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
    find: jest.fn(() => ({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    })),
  },
}));

jest.mock("../../users/users.model", () => ({
  UserModel: {
    find: jest.fn(() => ({ select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([]) })) })),
    findById: jest.fn(() => ({
      select: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(null) })),
    })),
  },
}));

import { PropertiesRepository } from "../properties.repository";

describe("PropertiesRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("delegates to QueryBuilder with agencyId + text search + location regex", async () => {
      mockQbExec.mockResolvedValue({ data: [], total: 0 });

      await PropertiesRepository.list({
        agencyId: "ag1",
        q: "beach",
        location: "miami",
        page: 1,
        limit: 12,
      });

      expect(mockWhere).toHaveBeenCalledWith("agencyId", "ag1");
      expect(mockWhereTextSearch).toHaveBeenCalledWith("beach");
      expect(mockWhereRegex).toHaveBeenCalledWith("location", "miami");
    });

    it("passes price range, beds, propertyType, status, sort", async () => {
      mockQbExec.mockResolvedValue({ data: [], total: 0 });

      await PropertiesRepository.list({
        agencyId: "ag1",
        propertyType: "house",
        priceMin: 100000,
        priceMax: 500000,
        beds: 3,
        status: "available",
        sort: "price-asc",
        page: 1,
        limit: 12,
      });

      expect(mockWhere).toHaveBeenCalledWith("propertyType", "house");
      expect(mockWhere).toHaveBeenCalledWith("status", "available");
      expect(mockWhereRange).toHaveBeenCalledWith("beds", 3);
      expect(mockWhereRange).toHaveBeenCalledWith("price", 100000, 500000);
      expect(mockSortBy).toHaveBeenCalledWith(expect.any(Object), "price-asc");
    });

    it("returns paginated data", async () => {
      const rawData = [{ id: "1", title: "Property" }];
      mockQbExec.mockResolvedValue({ data: rawData, total: 1 });

      const result = await PropertiesRepository.list({
        agencyId: "ag1",
        page: 1,
        limit: 12,
      });
      expect(result.data).toEqual(rawData);
      expect(result.total).toBe(1);
    });
  });

  describe("findById", () => {
    it("queries with _id + agencyId + lean", async () => {
      const doc = { _id: "id1", title: "Property" };
      const { PropertyModel } = jest.requireMock("../properties.model");
      PropertyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(doc),
      });

      const result = await PropertiesRepository.findById("id1", "ag1");
      expect(PropertyModel.findOne).toHaveBeenCalledWith({
        _id: "id1",
        agencyId: "ag1",
      });
      expect(result).toEqual(doc);
    });

    it("returns null when not found", async () => {
      const { PropertyModel } = jest.requireMock("../properties.model");
      PropertyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await PropertiesRepository.findById("nonexistent", "ag1");
      expect(result).toBeNull();
    });
  });

  describe("findBySlug", () => {
    it("queries with slug + agencyId + lean", async () => {
      const { PropertyModel } = jest.requireMock("../properties.model");
      PropertyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({
          slug: "beach-house",
          agencyId: "ag1",
        }),
      });

      const result = await PropertiesRepository.findBySlug("beach-house", "ag1");
      expect(PropertyModel.findOne).toHaveBeenCalledWith({
        slug: "beach-house",
        agencyId: "ag1",
      });
      expect(result).toEqual({ slug: "beach-house", agencyId: "ag1" });
    });
  });

  describe("create", () => {
    it("calls PropertyModel.create", async () => {
      const data = { title: "New Property" };
      const { PropertyModel } = jest.requireMock("../properties.model");
      PropertyModel.create.mockResolvedValue(data);

      const result = await PropertiesRepository.create(data as any);
      expect(PropertyModel.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
  });

  describe("update", () => {
    it("calls findOneAndUpdate with { new: true }", async () => {
      const updated = { _id: "id1", title: "Updated" };
      const { PropertyModel } = jest.requireMock("../properties.model");
      PropertyModel.findOneAndUpdate.mockResolvedValue(updated);

      const result = await PropertiesRepository.update("id1", "ag1", {
        title: "Updated",
      });
      expect(PropertyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "id1", agencyId: "ag1" },
        { title: "Updated" },
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it("returns null when not found", async () => {
      const { PropertyModel } = jest.requireMock("../properties.model");
      PropertyModel.findOneAndUpdate.mockResolvedValue(null);

      const result = await PropertiesRepository.update("nonexistent", "ag1", {
        title: "Nope",
      });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("calls deleteOne and returns true when deleted", async () => {
      const { PropertyModel } = jest.requireMock("../properties.model");
      PropertyModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await PropertiesRepository.delete("id1", "ag1");
      expect(PropertyModel.deleteOne).toHaveBeenCalledWith({
        _id: "id1",
        agencyId: "ag1",
      });
      expect(result).toBe(true);
    });

    it("returns false when nothing deleted", async () => {
      const { PropertyModel } = jest.requireMock("../properties.model");
      PropertyModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await PropertiesRepository.delete("id1", "ag1");
      expect(result).toBe(false);
    });
  });

  describe("findRelated", () => {
    it("finds property first, then queries related by type and price range", async () => {
      const property = {
        _id: "id1",
        propertyType: "house",
        price: 300000,
        agencyId: "ag1",
      };
      const related = [
        { _id: "id2", title: "Related 1" },
        { _id: "id3", title: "Related 2" },
      ];
      const { PropertyModel } = jest.requireMock("../properties.model");
      PropertyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(property),
      });
      PropertyModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(related),
      });

      const result = await PropertiesRepository.findRelated("id1", "ag1", 4);

      expect(PropertyModel.findOne).toHaveBeenCalledWith({
        _id: "id1",
        agencyId: "ag1",
      });
      expect(PropertyModel.find).toHaveBeenCalledWith({
        _id: { $ne: "id1" },
        agencyId: "ag1",
        propertyType: "house",
        status: "available",
        price: { $gte: 210000, $lte: 390000 },
      });
      expect(result).toEqual(related);
    });

    it("returns empty array when property not found", async () => {
      const { PropertyModel } = jest.requireMock("../properties.model");
      PropertyModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await PropertiesRepository.findRelated("nonexistent", "ag1");
      expect(result).toEqual([]);
      expect(PropertyModel.find).not.toHaveBeenCalled();
    });
  });
});
