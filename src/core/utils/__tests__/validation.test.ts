import { objectId, objectIdParam } from "../validation";

describe("objectId", () => {
  it("accepts valid 24-char hex string", () => {
    const result = objectId.safeParse("507f1f77bcf86cd799439011");
    expect(result.success).toBe(true);
  });

  it("rejects non-hex characters", () => {
    const result = objectId.safeParse("507f1f77bcf86cd79943901z");
    expect(result.success).toBe(false);
  });

  it("rejects wrong length", () => {
    const result = objectId.safeParse("507f1f77bcf86cd7994390");
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = objectId.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("objectIdParam", () => {
  it("accepts valid objectId in params", () => {
    const result = objectIdParam.safeParse({ id: "507f1f77bcf86cd799439011" });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = objectIdParam.safeParse({});
    expect(result.success).toBe(false);
  });
});
