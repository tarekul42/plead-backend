const mockList = jest.fn();
const mockFindById = jest.fn();
const mockFindBySlug = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindRelated = jest.fn();

jest.mock("../properties.repository", () => ({
  PropertiesRepository: {
    list: mockList,
    findById: mockFindById,
    findBySlug: mockFindBySlug,
    create: mockCreate,
    update: mockUpdate,
    findRelated: mockFindRelated,
  },
}));

const mockDeleteOne = jest.fn();
const mockStartSession = jest.fn();
const mockSession = {
  startTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  endSession: jest.fn(),
};

const mockFindOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
jest.mock("../properties.model", () => ({
  PropertyModel: {
    findOne: mockFindOne,
    startSession: mockStartSession,
    deleteOne: mockDeleteOne,
  },
}));

const mockSessionFn = jest.fn();
const mockDeleteMany = jest.fn().mockReturnValue({ session: mockSessionFn });
jest.mock("../../reviews/reviews.model", () => ({
  ReviewModel: { deleteMany: mockDeleteMany },
}));

import { PropertiesService } from "../properties.service";

describe("PropertiesService", () => {
  beforeEach(() => {
    mockList.mockReset();
    mockFindById.mockReset();
    mockFindBySlug.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockFindRelated.mockReset();
    mockDeleteOne.mockReset();
    mockStartSession.mockReset();
    mockSession.startTransaction.mockReset();
    mockSession.abortTransaction.mockReset();
    mockSession.commitTransaction.mockReset();
    mockSession.endSession.mockReset();
    mockDeleteMany.mockReset();
    mockSessionFn.mockReset();

    mockStartSession.mockResolvedValue(mockSession);
    mockDeleteMany.mockReturnValue({ session: mockSessionFn });
  });

  describe("list", () => {
    it("delegates to repository", async () => {
      mockList.mockResolvedValue({ data: [], total: 0 });
      const result = await PropertiesService.list({ page: 1, limit: 12 } as any, "agency_1");
      expect(mockList).toHaveBeenCalledWith({ page: 1, limit: 12, agencyId: "agency_1" });
      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe("delete", () => {
    it("returns true on successful deletion", async () => {
      mockDeleteOne.mockResolvedValue({ deletedCount: 1 });
      const result = await PropertiesService.delete("abc", "agency_1");
      expect(result).toBe(true);
    });

    it("aborts transaction on error", async () => {
      mockDeleteOne.mockRejectedValue(new Error("db error"));
      await expect(PropertiesService.delete("abc", "agency_1")).rejects.toThrow();
    });
  });
});
