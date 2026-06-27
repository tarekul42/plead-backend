import { updateUserSchema } from "../users.validation";

describe("updateUserSchema", () => {
  it("should accept an empty object (all fields optional)", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept valid name", () => {
    const result = updateUserSchema.safeParse({ name: "John Doe" });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = updateUserSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should accept valid phone", () => {
    const result = updateUserSchema.safeParse({ phone: "+1234567890" });
    expect(result.success).toBe(true);
  });

  it("should accept valid title", () => {
    const result = updateUserSchema.safeParse({ title: "Senior Agent" });
    expect(result.success).toBe(true);
  });

  it("should accept all fields together", () => {
    const result = updateUserSchema.safeParse({
      name: "Jane Doe",
      phone: "+1987654321",
      title: "Manager",
    });
    expect(result.success).toBe(true);
  });

  it("should reject non-string name", () => {
    const result = updateUserSchema.safeParse({ name: 123 });
    expect(result.success).toBe(false);
  });

  it("should reject non-string phone", () => {
    const result = updateUserSchema.safeParse({ phone: 12345 });
    expect(result.success).toBe(false);
  });

  it("should reject non-string title", () => {
    const result = updateUserSchema.safeParse({ title: true });
    expect(result.success).toBe(false);
  });

  it("should strip unknown fields", () => {
    const result = updateUserSchema.safeParse({ name: "John", role: "admin" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("role");
    }
  });
});
