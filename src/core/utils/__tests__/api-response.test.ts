import { success, error } from "../../utils/api-response";

describe("api-response", () => {
  describe("success", () => {
    it("returns a success envelope with data", () => {
      const result = success({ id: 1, name: "PropLead" });
      expect(result).toEqual({ success: true, data: { id: 1, name: "PropLead" } });
    });

    it("returns success: true flag", () => {
      expect(success("ok")).toHaveProperty("success", true);
    });

    it("includes data of various types", () => {
      expect(success(42).data).toBe(42);
      expect(success("hello").data).toBe("hello");
      expect(success([1, 2, 3]).data).toEqual([1, 2, 3]);
      expect(success(null).data).toBeNull();
    });

    it("omits meta when not provided", () => {
      const result = success("data");
      expect(result).not.toHaveProperty("meta");
    });

    it("omits meta when undefined is passed explicitly", () => {
      const result = success("data", undefined);
      expect(result).not.toHaveProperty("meta");
    });

    it("includes meta when provided", () => {
      const meta = { page: 1, total: 10 };
      const result = success([1, 2], meta);
      expect(result).toEqual({ success: true, data: [1, 2], meta });
    });

    it("includes meta when an empty object is passed", () => {
      const result = success("data", {});
      expect(result).toHaveProperty("meta", {});
    });
  });

  describe("error", () => {
    it("returns an error envelope with code and message", () => {
      const result = error("NOT_FOUND", "Resource missing");
      expect(result).toEqual({
        success: false,
        error: { code: "NOT_FOUND", message: "Resource missing" },
      });
    });

    it("returns success: false flag", () => {
      expect(error("CODE", "msg")).toHaveProperty("success", false);
    });

    it("omits details when not provided", () => {
      const result = error("CODE", "msg");
      expect(result.error).not.toHaveProperty("details");
    });

    it("omits details when undefined is passed explicitly", () => {
      const result = error("CODE", "msg", undefined);
      expect(result.error).not.toHaveProperty("details");
    });

    it("includes details when provided", () => {
      const details = { field: "email", reason: "required" };
      const result = error("VALIDATION_ERROR", "Bad input", details);
      expect(result).toEqual({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Bad input", details },
      });
    });

    it("includes details when an empty object is passed", () => {
      const result = error("CODE", "msg", {});
      expect(result.error).toHaveProperty("details", {});
    });
  });
});
