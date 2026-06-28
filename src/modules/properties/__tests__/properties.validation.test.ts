import {
  createPropertySchema,
  updatePropertySchema,
  propertyParamSchema,
  propertySlugParamSchema,
  listPropertiesQuerySchema,
} from "../properties.validation";

const VALID_OBJECT_ID = "64b7f0c2e1a2b3c4d5e6f701";

function validCreatePayload() {
  return {
    title: "Modern Family Home",
    description: "A spacious modern home.",
    price: 500000,
    location: "Austin, TX",
    images: ["img1.jpg"],
    beds: 4,
    baths: 3,
    area: 2400,
    propertyType: "house",
    assignedAgentId: VALID_OBJECT_ID,
  };
}

describe("createPropertySchema", () => {
  it("accepts a fully valid payload", () => {
    const result = createPropertySchema.safeParse(validCreatePayload());
    expect(result.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const result = createPropertySchema.safeParse({
      ...validCreatePayload(),
      address: "123 Main St",
      coordinates: { lat: 30.27, lng: -97.74 },
      status: "available",
      features: ["garage", "pool"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing required field (title)", () => {
    const { title: _title, ...payload } = validCreatePayload();
    const result = createPropertySchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = createPropertySchema.safeParse({ ...validCreatePayload(), title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a title longer than 200 characters", () => {
    const result = createPropertySchema.safeParse({
      ...validCreatePayload(),
      title: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a title at the 200-character boundary", () => {
    const result = createPropertySchema.safeParse({
      ...validCreatePayload(),
      title: "a".repeat(200),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a description longer than 2000 characters", () => {
    const result = createPropertySchema.safeParse({
      ...validCreatePayload(),
      description: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative price", () => {
    const result = createPropertySchema.safeParse({ ...validCreatePayload(), price: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts a price of zero", () => {
    const result = createPropertySchema.safeParse({ ...validCreatePayload(), price: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid propertyType enum", () => {
    const result = createPropertySchema.safeParse({
      ...validCreatePayload(),
      propertyType: "castle",
    });
    expect(result.success).toBe(false);
  });

  it("rejects beds above 100", () => {
    const result = createPropertySchema.safeParse({ ...validCreatePayload(), beds: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects negative beds", () => {
    const result = createPropertySchema.safeParse({ ...validCreatePayload(), beds: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects an empty images array", () => {
    const result = createPropertySchema.safeParse({ ...validCreatePayload(), images: [] });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid assignedAgentId (ObjectId)", () => {
    const result = createPropertySchema.safeParse({
      ...validCreatePayload(),
      assignedAgentId: "not-an-id",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing assignedAgentId", () => {
    const { assignedAgentId: _assignedAgentId, ...payload } = validCreatePayload();
    const result = createPropertySchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("updatePropertySchema", () => {
  it("accepts a partial update", () => {
    const result = updatePropertySchema.safeParse({ title: "Updated Title" });
    expect(result.success).toBe(true);
  });

  it("accepts an empty object (all fields optional)", () => {
    const result = updatePropertySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects a title longer than 200 characters", () => {
    const result = updatePropertySchema.safeParse({ title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects a negative price", () => {
    const result = updatePropertySchema.safeParse({ price: -50 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid propertyType enum", () => {
    const result = updatePropertySchema.safeParse({ propertyType: "castle" });
    expect(result.success).toBe(false);
  });

  it("rejects beds above 100", () => {
    const result = updatePropertySchema.safeParse({ beds: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid assignedAgentId", () => {
    const result = updatePropertySchema.safeParse({ assignedAgentId: "bad-id" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid assignedAgentId", () => {
    const result = updatePropertySchema.safeParse({ assignedAgentId: VALID_OBJECT_ID });
    expect(result.success).toBe(true);
  });
});

describe("propertyParamSchema", () => {
  it("accepts a valid ObjectId", () => {
    const result = propertyParamSchema.safeParse({ id: VALID_OBJECT_ID });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid ObjectId", () => {
    const result = propertyParamSchema.safeParse({ id: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing id", () => {
    const result = propertyParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("propertySlugParamSchema", () => {
  it("accepts a non-empty slug", () => {
    const result = propertySlugParamSchema.safeParse({ slug: "modern-family-home" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty slug", () => {
    const result = propertySlugParamSchema.safeParse({ slug: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing slug", () => {
    const result = propertySlugParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("listPropertiesQuerySchema", () => {
  it("applies defaults for page and limit", () => {
    const result = listPropertiesQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
    }
  });

  it("coerces string query params to numbers", () => {
    const result = listPropertiesQuerySchema.safeParse({
      page: "3",
      limit: "24",
      priceMin: "100000",
      priceMax: "500000",
      beds: "4",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(24);
      expect(result.data.priceMin).toBe(100000);
      expect(result.data.priceMax).toBe(500000);
      expect(result.data.beds).toBe(4);
    }
  });

  it("accepts a valid enum for propertyType", () => {
    const result = listPropertiesQuerySchema.safeParse({ propertyType: "apartment" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid enum for propertyType", () => {
    const result = listPropertiesQuerySchema.safeParse({ propertyType: "castle" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid enum for status", () => {
    const result = listPropertiesQuerySchema.safeParse({ status: "sold" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid enum for status", () => {
    const result = listPropertiesQuerySchema.safeParse({ status: "gone" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid sort value", () => {
    const result = listPropertiesQuerySchema.safeParse({ sort: "price-asc" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid sort value", () => {
    const result = listPropertiesQuerySchema.safeParse({ sort: "cheapest" });
    expect(result.success).toBe(false);
  });

  it("allows an optional text search", () => {
    const result = listPropertiesQuerySchema.safeParse({ q: "modern" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("modern");
    }
  });
});
