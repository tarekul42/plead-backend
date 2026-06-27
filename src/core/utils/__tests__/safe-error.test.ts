import { getErrorMessage, getErrorCode } from "../../utils/safe-error";

describe("safe-error", () => {
  describe("getErrorMessage", () => {
    it("returns the message of an Error instance", () => {
      expect(getErrorMessage(new Error("boom"))).toBe("boom");
    });

    it("returns the message of a subclassed error", () => {
      class CustomError extends Error {}
      expect(getErrorMessage(new CustomError("custom"))).toBe("custom");
    });

    it("stringifies a number", () => {
      expect(getErrorMessage(42)).toBe("42");
    });

    it("stringifies a string", () => {
      expect(getErrorMessage("plain string")).toBe("plain string");
    });

    it("stringifies an object", () => {
      expect(getErrorMessage({ a: 1 })).toBe("[object Object]");
    });

    it("stringifies null", () => {
      expect(getErrorMessage(null)).toBe("null");
    });

    it("stringifies undefined", () => {
      expect(getErrorMessage(undefined)).toBe("undefined");
    });

    it("returns the fallback for an empty string", () => {
      expect(getErrorMessage("", "fallback")).toBe("fallback");
    });

    it("uses the default fallback when none is provided", () => {
      expect(getErrorMessage("")).toBe("Unknown error");
    });

    it("does not use the fallback for a non-empty string", () => {
      expect(getErrorMessage("real", "fallback")).toBe("real");
    });

    it("does not use the fallback for an Error with an empty message", () => {
      expect(getErrorMessage(new Error(""))).toBe("");
    });
  });

  describe("getErrorCode", () => {
    it("returns the code when err is an object with a numeric code", () => {
      expect(getErrorCode({ code: 11000 })).toBe(11000);
    });

    it("returns undefined when err is an Error without a code", () => {
      expect(getErrorCode(new Error("boom"))).toBeUndefined();
    });

    it("returns undefined when err is null", () => {
      expect(getErrorCode(null)).toBeUndefined();
    });

    it("returns undefined when err is undefined", () => {
      expect(getErrorCode(undefined)).toBeUndefined();
    });

    it("returns undefined for a primitive string", () => {
      expect(getErrorCode("string")).toBeUndefined();
    });

    it("returns undefined for a primitive number", () => {
      expect(getErrorCode(42)).toBeUndefined();
    });

    it("returns the code value regardless of its type", () => {
      // The implementation only checks for the presence of the "code" key,
      // so a string code is returned as-is.
      expect(getErrorCode({ code: "11000" })).toBe("11000");
    });

    it("returns 0 when code is 0", () => {
      expect(getErrorCode({ code: 0 })).toBe(0);
    });

    it("returns the code from an Error subclass with a code property", () => {
      const err = new Error("boom") as Error & { code: number };
      err.code = 42;
      expect(getErrorCode(err)).toBe(42);
    });
  });
});
