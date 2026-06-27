import {
  createAgencySchema,
  updateAgencySchema,
  agencyParamSchema,
} from "../agencies.validation";

describe("Agencies validation schemas", () => {
  describe("createAgencySchema", () => {
    it("accepts a valid name", () => {
      const result = createAgencySchema.safeParse({ name: "My Agency" });
      expect(result.success).toBe(true);
    });

    it("accepts optional logoUrl and plan", () => {
      const result = createAgencySchema.safeParse({
        name: "My Agency",
        logoUrl: "https://example.com/logo.png",
        plan: "pro",
      });
      expect(result.success).toBe(true);
    });

    it("rejects an empty name", () => {
      const result = createAgencySchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("rejects a missing name", () => {
      const result = createAgencySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects a name longer than 200 chars", () => {
      const result = createAgencySchema.safeParse({ name: "a".repeat(201) });
      expect(result.success).toBe(false);
    });

    it("rejects an invalid plan", () => {
      const result = createAgencySchema.safeParse({ name: "Agency", plan: "starter" });
      expect(result.success).toBe(false);
    });
  });

  describe("updateAgencySchema", () => {
    it("accepts a partial update", () => {
      const result = updateAgencySchema.safeParse({ name: "Renamed" });
      expect(result.success).toBe(true);
    });

    it("accepts an empty object (all fields optional)", () => {
      const result = updateAgencySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("rejects an empty name", () => {
      const result = updateAgencySchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("rejects an invalid plan", () => {
      const result = updateAgencySchema.safeParse({ plan: "starter" });
      expect(result.success).toBe(false);
    });
  });

  describe("agencyParamSchema", () => {
    it("accepts a valid 24-hex ObjectId", () => {
      const result = agencyParamSchema.safeParse({ id: "507f1f77bcf86cd799439011" });
      expect(result.success).toBe(true);
    });

    it("rejects an invalid id", () => {
      const result = agencyParamSchema.safeParse({ id: "not-an-objectid" });
      expect(result.success).toBe(false);
    });

    it("rejects a missing id", () => {
      const result = agencyParamSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
