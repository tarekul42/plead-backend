import { success, error } from "../api-response";

describe("success", () => {
  it("returns success envelope with data", () => {
    const res = success({ id: 1 });
    expect(res).toEqual({ success: true, data: { id: 1 } });
  });

  it("includes meta when provided", () => {
    const meta = { page: 1, limit: 10, total: 5, totalPages: 1 };
    const res = success([], meta);
    expect(res.success).toBe(true);
    expect(res.meta).toEqual(meta);
  });
});

describe("error", () => {
  it("returns error envelope with code and message", () => {
    const res = error("NOT_FOUND", "User not found");
    expect(res).toEqual({
      success: false,
      error: { code: "NOT_FOUND", message: "User not found" },
    });
  });

  it("includes details when provided", () => {
    const details = { field: "email" };
    const res = error("VALIDATION", "Invalid", details);
    expect(res.error.details).toEqual(details);
  });
});
