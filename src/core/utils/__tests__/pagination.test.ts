import { Pagination } from "../../utils/pagination";

describe("pagination", () => {
  describe("Pagination.from", () => {
    it("returns default page and limit when query is empty", () => {
      const result = Pagination.from({});
      expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it("parses valid page and limit", () => {
      const result = Pagination.from({ page: "3", limit: "10" });
      expect(result).toEqual({ page: 3, limit: 10, skip: 20 });
    });

    it("calculates skip from page and limit", () => {
      expect(Pagination.from({ page: "2", limit: "15" }).skip).toBe(15);
      expect(Pagination.from({ page: "4", limit: "10" }).skip).toBe(30);
    });

    it("floors fractional page and limit values", () => {
      const result = Pagination.from({ page: "2.7", limit: "10.9" });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it("clamps page to a minimum of 1", () => {
      expect(Pagination.from({ page: "0" }).page).toBe(1);
      expect(Pagination.from({ page: "-5" }).page).toBe(1);
    });

    it("falls back to default limit when parsed limit is 0", () => {
      // Number("0") is 0, which is falsy, so the || defaultLimit branch fires.
      expect(Pagination.from({ limit: "0" }).limit).toBe(20);
    });

    it("clamps a negative limit to a minimum of 1", () => {
      expect(Pagination.from({ limit: "-10" }).limit).toBe(1);
    });

    it("clamps limit to the default max of 100", () => {
      expect(Pagination.from({ limit: "200" }).limit).toBe(100);
    });

    it("uses a custom default limit", () => {
      expect(Pagination.from({}, 50).limit).toBe(50);
    });

    it("uses a custom max limit", () => {
      expect(Pagination.from({ limit: "200" }, 20, 50).limit).toBe(50);
    });

    it("falls back to default limit when limit is not a number", () => {
      expect(Pagination.from({ limit: "abc" }).limit).toBe(20);
    });

    it("falls back to page 1 when page is not a number", () => {
      expect(Pagination.from({ page: "abc" }).page).toBe(1);
    });

    it("handles NaN values gracefully", () => {
      const result = Pagination.from({ page: NaN, limit: NaN });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe("Pagination.meta", () => {
    it("returns pagination metadata", () => {
      const meta = Pagination.meta(2, 10, 95);
      expect(meta).toEqual({ page: 2, limit: 10, total: 95, totalPages: 10 });
    });

    it("computes totalPages via ceiling division", () => {
      expect(Pagination.meta(1, 20, 20).totalPages).toBe(1);
      expect(Pagination.meta(1, 20, 21).totalPages).toBe(2);
      expect(Pagination.meta(1, 10, 100).totalPages).toBe(10);
      expect(Pagination.meta(1, 10, 99).totalPages).toBe(10);
    });

    it("clamps totalPages to a minimum of 1", () => {
      expect(Pagination.meta(1, 10, 0).totalPages).toBe(1);
    });
  });
});
