import { hashInput } from "../hash";

describe("hashInput", () => {
  it("returns a 64-character hex string", () => {
    const hash = hashInput({ leadId: "abc", tone: "professional" });
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns same hash for same input", () => {
    const a = hashInput({ leadId: "abc", tone: "professional" });
    const b = hashInput({ leadId: "abc", tone: "professional" });
    expect(a).toBe(b);
  });

  it("returns different hash for different input", () => {
    const a = hashInput({ leadId: "abc" });
    const b = hashInput({ leadId: "def" });
    expect(a).not.toBe(b);
  });

  it("handles objects with circular references gracefully", () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;
    const hash = hashInput(obj);
    expect(hash).toHaveLength(64);
  });
});
