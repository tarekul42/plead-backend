import {
  createBlogSchema,
  updateBlogSchema,
  listBlogsQuerySchema,
  blogIdParamSchema,
  blogSlugParamSchema,
} from "../blogs.validation";

describe("createBlogSchema", () => {
  it("should accept valid minimal data with required fields", () => {
    const result = createBlogSchema.safeParse({ title: "My Post", content: "Hello world" });
    expect(result.success).toBe(true);
  });

  it("should accept all fields", () => {
    const result = createBlogSchema.safeParse({
      title: "My Post",
      content: "Hello world",
      excerpt: "A short summary",
      coverImage: "https://example.com/image.jpg",
      tags: ["real-estate", "tips"],
      status: "draft",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing title", () => {
    const result = createBlogSchema.safeParse({ content: "Hello world" });
    expect(result.success).toBe(false);
  });

  it("should reject empty title", () => {
    const result = createBlogSchema.safeParse({ title: "", content: "Hello world" });
    expect(result.success).toBe(false);
  });

  it("should reject title exceeding 200 characters", () => {
    const result = createBlogSchema.safeParse({ title: "a".repeat(201), content: "Hello" });
    expect(result.success).toBe(false);
  });

  it("should accept title at exactly 200 characters", () => {
    const result = createBlogSchema.safeParse({ title: "a".repeat(200), content: "Hello" });
    expect(result.success).toBe(true);
  });

  it("should reject missing content", () => {
    const result = createBlogSchema.safeParse({ title: "My Post" });
    expect(result.success).toBe(false);
  });

  it("should reject empty content", () => {
    const result = createBlogSchema.safeParse({ title: "My Post", content: "" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid status value", () => {
    const result = createBlogSchema.safeParse({ title: "My Post", content: "Hello", status: "archived" });
    expect(result.success).toBe(false);
  });

  it("should accept draft status", () => {
    const result = createBlogSchema.safeParse({ title: "My Post", content: "Hello", status: "draft" });
    expect(result.success).toBe(true);
  });

  it("should accept published status", () => {
    const result = createBlogSchema.safeParse({ title: "My Post", content: "Hello", status: "published" });
    expect(result.success).toBe(true);
  });

  it("should reject excerpt exceeding 500 characters", () => {
    const result = createBlogSchema.safeParse({ title: "My Post", content: "Hello", excerpt: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("should accept excerpt at exactly 500 characters", () => {
    const result = createBlogSchema.safeParse({ title: "My Post", content: "Hello", excerpt: "a".repeat(500) });
    expect(result.success).toBe(true);
  });

  it("should reject non-array tags", () => {
    const result = createBlogSchema.safeParse({ title: "My Post", content: "Hello", tags: "real-estate" });
    expect(result.success).toBe(false);
  });
});

describe("updateBlogSchema", () => {
  it("should accept an empty object (all fields optional)", () => {
    const result = updateBlogSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept valid partial update", () => {
    const result = updateBlogSchema.safeParse({ title: "Updated Title", status: "published" });
    expect(result.success).toBe(true);
  });

  it("should reject empty title", () => {
    const result = updateBlogSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("should reject empty content", () => {
    const result = updateBlogSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid status", () => {
    const result = updateBlogSchema.safeParse({ status: "deleted" });
    expect(result.success).toBe(false);
  });

  it("should reject title exceeding 200 characters", () => {
    const result = updateBlogSchema.safeParse({ title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("should reject excerpt exceeding 500 characters", () => {
    const result = updateBlogSchema.safeParse({ excerpt: "a".repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe("listBlogsQuerySchema", () => {
  it("should apply defaults for missing page and limit", () => {
    const result = listBlogsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should coerce string page and limit to numbers", () => {
    const result = listBlogsQuerySchema.safeParse({ page: "3", limit: "25" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(25);
    }
  });

  it("should accept valid status filter", () => {
    const result = listBlogsQuerySchema.safeParse({ status: "published" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid status filter", () => {
    const result = listBlogsQuerySchema.safeParse({ status: "archived" });
    expect(result.success).toBe(false);
  });
});

describe("blogIdParamSchema", () => {
  it("should accept valid 24-char hex ObjectId", () => {
    const result = blogIdParamSchema.safeParse({ id: "507f1f77bcf86cd799439041" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid ObjectId", () => {
    const result = blogIdParamSchema.safeParse({ id: "123" });
    expect(result.success).toBe(false);
  });

  it("should reject missing id", () => {
    const result = blogIdParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("blogSlugParamSchema", () => {
  it("should accept valid slug", () => {
    const result = blogSlugParamSchema.safeParse({ slug: "my-first-post" });
    expect(result.success).toBe(true);
  });

  it("should reject empty slug", () => {
    const result = blogSlugParamSchema.safeParse({ slug: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing slug", () => {
    const result = blogSlugParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
