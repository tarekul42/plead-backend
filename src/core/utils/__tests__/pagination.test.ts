import { Pagination } from "../pagination";

describe("Pagination.from", () => {
  it("returns default values when query is empty", () => {
    const result = Pagination.from({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  it("parses page and limit from query", () => {
    const result = Pagination.from({ page: "3", limit: "10" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
    expect(result.skip).toBe(20);
  });

  it("clamps page to minimum 1", () => {
    expect(Pagination.from({ page: "0" }).page).toBe(1);
    expect(Pagination.from({ page: "-5" }).page).toBe(1);
  });

  it("clamps limit within bounds", () => {
    expect(Pagination.from({ limit: "0" }).limit).toBe(20);
    expect(Pagination.from({ limit: "999" }).limit).toBe(100);
  });

  it("accepts custom defaultLimit and maxLimit", () => {
    const result = Pagination.from({}, 50, 200);
    expect(result.limit).toBe(50);
    const clamped = Pagination.from({ limit: "500" }, 50, 200);
    expect(clamped.limit).toBe(200);
  });
});

describe("Pagination.meta", () => {
  it("returns correct pagination metadata", () => {
    const meta = Pagination.meta(2, 10, 45);
    expect(meta).toEqual({ page: 2, limit: 10, total: 45, totalPages: 5 });
  });

  it("returns 1 totalPages when total is 0", () => {
    const meta = Pagination.meta(1, 20, 0);
    expect(meta.totalPages).toBe(1);
  });

  it("rounds up totalPages", () => {
    const meta = Pagination.meta(1, 10, 11);
    expect(meta.totalPages).toBe(2);
  });
});
