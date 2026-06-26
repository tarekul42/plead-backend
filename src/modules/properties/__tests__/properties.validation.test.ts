import { createPropertySchema, updatePropertySchema, listPropertiesQuerySchema } from "../properties.validation";

describe("Properties validation", () => {
  describe("createPropertySchema", () => {
    it("accepts valid input", () => {
      const result = createPropertySchema.safeParse({
        title: "Modern House",
        description: "A beautiful modern house",
        price: 500000,
        location: "New York",
        images: ["https://example.com/img.jpg"],
        beds: 3,
        baths: 2,
        area: 1500,
        propertyType: "house",
        assignedAgentId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing required fields", () => {
      const result = createPropertySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects invalid propertyType", () => {
      const result = createPropertySchema.safeParse({
        title: "Test", description: "Desc", price: 100, location: "NY",
        images: ["img.jpg"], beds: 1, baths: 1, area: 500,
        propertyType: "invalid", assignedAgentId: "507f1f77bcf86cd799439011",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updatePropertySchema", () => {
    it("accepts partial update", () => {
      const result = updatePropertySchema.safeParse({ price: 600000 });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = updatePropertySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("listPropertiesQuerySchema", () => {
    it("provides defaults for page and limit", () => {
      const result = listPropertiesQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(12);
      }
    });

    it("coerces string numbers", () => {
      const result = listPropertiesQuerySchema.safeParse({ page: "2", limit: "20" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
      }
    });
  });
});
