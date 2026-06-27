import {
  createReviewSchema,
  updateReviewSchema,
  reviewPropertyParamSchema,
  reviewIdParamSchema,
} from "../reviews.validation";

describe("createReviewSchema", () => {
  it("should accept valid minimal data with required rating", () => {
    const result = createReviewSchema.safeParse({ rating: 4 });
    expect(result.success).toBe(true);
  });

  it("should accept all fields", () => {
    const result = createReviewSchema.safeParse({
      rating: 5,
      title: "Excellent",
      comment: "Wonderful experience from start to finish",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing rating", () => {
    const result = createReviewSchema.safeParse({ title: "Nice" });
    expect(result.success).toBe(false);
  });

  it("should reject rating below 1", () => {
    const result = createReviewSchema.safeParse({ rating: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject rating above 5", () => {
    const result = createReviewSchema.safeParse({ rating: 6 });
    expect(result.success).toBe(false);
  });

  it("should accept rating at boundary 1", () => {
    const result = createReviewSchema.safeParse({ rating: 1 });
    expect(result.success).toBe(true);
  });

  it("should accept rating at boundary 5", () => {
    const result = createReviewSchema.safeParse({ rating: 5 });
    expect(result.success).toBe(true);
  });

  it("should reject non-number rating", () => {
    const result = createReviewSchema.safeParse({ rating: "five" });
    expect(result.success).toBe(false);
  });

  it("should reject title exceeding 200 characters", () => {
    const result = createReviewSchema.safeParse({ rating: 3, title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("should accept title at exactly 200 characters", () => {
    const result = createReviewSchema.safeParse({ rating: 3, title: "a".repeat(200) });
    expect(result.success).toBe(true);
  });

  it("should reject comment exceeding 2000 characters", () => {
    const result = createReviewSchema.safeParse({ rating: 3, comment: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("should accept comment at exactly 2000 characters", () => {
    const result = createReviewSchema.safeParse({ rating: 3, comment: "a".repeat(2000) });
    expect(result.success).toBe(true);
  });
});

describe("updateReviewSchema", () => {
  it("should accept an empty object (all fields optional)", () => {
    const result = updateReviewSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept valid partial update", () => {
    const result = updateReviewSchema.safeParse({ rating: 2, comment: "Changed my mind" });
    expect(result.success).toBe(true);
  });

  it("should reject rating below 1", () => {
    const result = updateReviewSchema.safeParse({ rating: 0 });
    expect(result.success).toBe(false);
  });

  it("should reject rating above 5", () => {
    const result = updateReviewSchema.safeParse({ rating: 10 });
    expect(result.success).toBe(false);
  });

  it("should reject title exceeding 200 characters", () => {
    const result = updateReviewSchema.safeParse({ title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("should reject comment exceeding 2000 characters", () => {
    const result = updateReviewSchema.safeParse({ comment: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });
});

describe("reviewPropertyParamSchema", () => {
  it("should accept valid 24-char hex ObjectId", () => {
    const result = reviewPropertyParamSchema.safeParse({ propertyId: "507f1f77bcf86cd799439014" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid ObjectId", () => {
    const result = reviewPropertyParamSchema.safeParse({ propertyId: "abc" });
    expect(result.success).toBe(false);
  });

  it("should reject missing propertyId", () => {
    const result = reviewPropertyParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("reviewIdParamSchema", () => {
  it("should accept valid ObjectId", () => {
    const result = reviewIdParamSchema.safeParse({ id: "507f1f77bcf86cd799439031" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid ObjectId", () => {
    const result = reviewIdParamSchema.safeParse({ id: "not-an-id" });
    expect(result.success).toBe(false);
  });
});
