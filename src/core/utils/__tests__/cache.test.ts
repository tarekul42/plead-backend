const mockFindOne = jest.fn();
const mockFindOneAndUpdate = jest.fn();
const mockModel = {
  findOne: mockFindOne,
  findOneAndUpdate: mockFindOneAndUpdate,
  lean: jest.fn(),
};

jest.mock("mongoose", () => ({
  Schema: Object.assign(
    jest.fn(() => ({ index: jest.fn() })),
    { Types: { Mixed: "Mixed", ObjectId: "ObjectId" } },
  ),
  model: jest.fn(() => mockModel),
  Document: class {},
}));

import { cacheGet, cacheSet } from "../cache";

describe("cache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("cacheGet", () => {
    it("returns parsed data when cache hits", async () => {
      mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ data: { name: "John" } }) });
      const result = await cacheGet<{ name: string }>("test-key");
      expect(result).toEqual({ name: "John" });
    });

    it("returns undefined when cache misses", async () => {
      mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      const result = await cacheGet("missing-key");
      expect(result).toBeUndefined();
    });
  });

  describe("cacheSet", () => {
    it("upserts with TTL", async () => {
      mockFindOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue({}) });
      await cacheSet("test-key", { name: "John" }, 3600000);
      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { key: "test-key" },
        { key: "test-key", data: { name: "John" }, expiresAt: expect.any(Date) },
        { upsert: true, new: true, lean: true },
      );
    });
  });
});
