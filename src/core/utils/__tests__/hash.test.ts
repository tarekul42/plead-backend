import { createHash } from "crypto";
import { hashInput } from "../../utils/hash";

describe("hash", () => {
  describe("hashInput", () => {
    it("returns a 64-character hex string (sha256)", () => {
      const result = hashInput({ a: 1 });
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it("produces the same hash for the same input", () => {
      const input = { foo: "bar", n: 42 };
      expect(hashInput(input)).toBe(hashInput(input));
    });

    it("produces a different hash when key insertion order differs", () => {
      // JSON.stringify preserves insertion order, so two objects with the
      // same keys but different insertion orders serialize differently.
      const a = { x: 1, y: 2, z: 3 };
      const b = { z: 3, x: 1, y: 2 };
      expect(hashInput(a)).not.toBe(hashInput(b));
    });

    it("produces the same hash for objects with identical key order", () => {
      const a = { x: 1, y: 2, z: 3 };
      const b = { x: 1, y: 2, z: 3 };
      expect(hashInput(a)).toBe(hashInput(b));
    });

    it("produces different hashes for different inputs", () => {
      expect(hashInput({ a: 1 })).not.toBe(hashInput({ a: 2 }));
    });

    it("matches a manually computed sha256 hex digest", () => {
      const input = { hello: "world" };
      const expected = createHash("sha256").update(JSON.stringify(input)).digest("hex");
      expect(hashInput(input)).toBe(expected);
    });

    it("handles nested objects", () => {
      const input = { a: { b: { c: [1, 2, 3] } } };
      const expected = createHash("sha256").update(JSON.stringify(input)).digest("hex");
      expect(hashInput(input)).toBe(expected);
    });

    it("falls back to String() when JSON.stringify throws", () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      const result = hashInput(circular);
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it("handles an object whose toJSON throws", () => {
      const bad = {
        toJSON() {
          throw new Error("nope");
        },
      };
      const result = hashInput(bad);
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it("handles empty object input", () => {
      const result = hashInput({});
      const expected = createHash("sha256").update("{}").digest("hex");
      expect(result).toBe(expected);
    });
  });
});
