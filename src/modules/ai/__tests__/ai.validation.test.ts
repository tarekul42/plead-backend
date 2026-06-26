import { matchLeadPropertiesSchema, generatePropertyDescriptionSchema, generateOutreachEmailSchema } from "../ai.validation";

describe("AI validation schemas", () => {
  describe("matchLeadPropertiesSchema", () => {
    it("accepts valid input", () => {
      const result = matchLeadPropertiesSchema.safeParse({
        leadId: "507f1f77bcf86cd799439011",
        propertyIds: ["507f1f77bcf86cd799439011"],
      });
      expect(result.success).toBe(true);
    });

    it("accepts without propertyIds", () => {
      const result = matchLeadPropertiesSchema.safeParse({ leadId: "507f1f77bcf86cd799439011" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid leadId", () => {
      const result = matchLeadPropertiesSchema.safeParse({ leadId: "bad" });
      expect(result.success).toBe(false);
    });
  });

  describe("generatePropertyDescriptionSchema", () => {
    it("accepts valid input", () => {
      const result = generatePropertyDescriptionSchema.safeParse({
        propertyId: "507f1f77bcf86cd799439011",
        tone: "luxury",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid tone", () => {
      const result = generatePropertyDescriptionSchema.safeParse({
        propertyId: "507f1f77bcf86cd799439011",
        tone: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("generateOutreachEmailSchema", () => {
    it("accepts valid input", () => {
      const result = generateOutreachEmailSchema.safeParse({
        leadId: "507f1f77bcf86cd799439011",
        propertyId: "507f1f77bcf86cd799439011",
        tone: "friendly",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid tone", () => {
      const result = generateOutreachEmailSchema.safeParse({
        leadId: "507f1f77bcf86cd799439011",
        propertyId: "507f1f77bcf86cd799439011",
        tone: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });
});
