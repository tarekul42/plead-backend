const mockFindOne = jest.fn();
const mockFindOneAndUpdate = jest.fn();

const SchemaClass = jest.fn().mockImplementation(() => ({
  index: jest.fn(),
}));
// Schema.Types.Mixed is accessed as a static on the Schema constructor.
(SchemaClass as any).Types = { Mixed: "Mixed" };

const mockCountDocuments = jest.fn().mockResolvedValue(0);
const mockFind = jest
  .fn()
  .mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }) });

jest.mock("mongoose", () => ({
  Schema: SchemaClass,
  model: jest.fn().mockReturnValue({
    findOne: mockFindOne,
    findOneAndUpdate: mockFindOneAndUpdate,
    countDocuments: mockCountDocuments,
    find: mockFind,
  }),
}));

import { cacheGet, cacheSet } from "../../utils/cache";

describe("cache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("cacheGet", () => {
    it("returns undefined when no entry is found", async () => {
      mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const result = await cacheGet("missing-key");

      expect(result).toBeUndefined();
    });

    it("returns the cached data when a valid entry exists", async () => {
      const cached = { key: "k1", data: { value: 42 }, expiresAt: new Date(Date.now() + 1000) };
      mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(cached) });

      const result = await cacheGet<{ value: number }>("k1");

      expect(result).toEqual({ value: 42 });
    });

    it("queries by key with a future expiresAt", async () => {
      const lean = jest.fn().mockResolvedValue(null);
      mockFindOne.mockReturnValue({ lean });

      await cacheGet("my-key");

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      const [filter] = mockFindOne.mock.calls[0];
      expect(filter.key).toBe("my-key");
      expect(filter.expiresAt).toEqual({ $gt: expect.any(Date) });
    });

    it("returns undefined for an expired entry", async () => {
      mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const result = await cacheGet("expired-key");

      expect(result).toBeUndefined();
    });
  });

  describe("cacheSet", () => {
    it("upserts a cache entry with the computed expiry", async () => {
      mockFindOneAndUpdate.mockResolvedValue({ key: "k1" });

      const before = Date.now();
      await cacheSet("k1", { hello: "world" }, 5000);
      const after = Date.now();

      expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(1);
      const [filter, update, options] = mockFindOneAndUpdate.mock.calls[0];

      expect(filter).toEqual({ key: "k1" });
      expect(update.key).toBe("k1");
      expect(update.data).toEqual({ hello: "world" });
      expect(update.expiresAt).toBeInstanceOf(Date);
      expect(update.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 5000);
      expect(update.expiresAt.getTime()).toBeLessThanOrEqual(after + 5000);
      expect(options).toEqual({ upsert: true, new: true, lean: true });
    });

    it("overwrites an existing entry for the same key", async () => {
      mockFindOneAndUpdate.mockResolvedValue({ key: "k1" });

      await cacheSet("k1", { v: 1 }, 1000);
      await cacheSet("k1", { v: 2 }, 2000);

      expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(2);
      const [, secondUpdate] = mockFindOneAndUpdate.mock.calls[1];
      expect(secondUpdate.data).toEqual({ v: 2 });
    });

    it("stores falsy data values", async () => {
      mockFindOneAndUpdate.mockResolvedValue({ key: "k1" });

      await cacheSet("k1", 0, 1000);

      const [, update] = mockFindOneAndUpdate.mock.calls[0];
      expect(update.data).toBe(0);
    });
  });
});
