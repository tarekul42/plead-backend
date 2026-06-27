import { z } from "zod";
import { objectId, objectIdParam } from "../../utils/validation";

describe("validation", () => {
  describe("objectId", () => {
    it("accepts a valid 24-character hex ObjectId", () => {
      const id = "507f1f77bcf86cd799439011";
      expect(objectId.safeParse(id).success).toBe(true);
    });

    it("accepts uppercase hex characters", () => {
      const id = "507F1F77BCF86CD799439011";
      expect(objectId.safeParse(id).success).toBe(true);
    });

    it("accepts mixed case hex characters", () => {
      const id = "507f1F77bCf86cD799439011";
      expect(objectId.safeParse(id).success).toBe(true);
    });

    it("rejects strings shorter than 24 characters", () => {
      expect(objectId.safeParse("507f1f77bcf86cd79943901").success).toBe(false);
    });

    it("rejects strings longer than 24 characters", () => {
      expect(objectId.safeParse("507f1f77bcf86cd7994390111").success).toBe(false);
    });

    it("rejects strings with non-hex characters", () => {
      expect(objectId.safeParse("507f1f77bcf86cd79943901g").success).toBe(false);
      expect(objectId.safeParse("zzzzzzzzzzzzzzzzzzzzzzzz").success).toBe(false);
    });

    it("rejects an empty string", () => {
      expect(objectId.safeParse("").success).toBe(false);
    });

    it("returns the expected error message on failure", () => {
      const result = objectId.safeParse("bad");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid ObjectId");
      }
    });
  });

  describe("objectIdParam", () => {
    it("accepts an object with a valid id", () => {
      const result = objectIdParam.safeParse({ id: "507f1f77bcf86cd799439011" });
      expect(result.success).toBe(true);
    });

    it("rejects an object with an invalid id", () => {
      const result = objectIdParam.safeParse({ id: "not-valid" });
      expect(result.success).toBe(false);
    });

    it("rejects an object missing the id field", () => {
      const result = objectIdParam.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects when id is not a string", () => {
      const result = objectIdParam.safeParse({ id: 12345 });
      expect(result.success).toBe(false);
    });

    it("rejects null and undefined input", () => {
      expect(objectIdParam.safeParse(null).success).toBe(false);
      expect(objectIdParam.safeParse(undefined).success).toBe(false);
    });

    it("validates as part of a larger zod schema", () => {
      const schema = z.object({
        params: objectIdParam,
        query: z.object({ active: z.string().optional() }),
      });
      const result = schema.safeParse({
        params: { id: "507f1f77bcf86cd799439011" },
        query: {},
      });
      expect(result.success).toBe(true);
    });
  });
});
