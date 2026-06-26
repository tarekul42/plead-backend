import { getErrorMessage, getErrorCode } from "../safe-error";

describe("getErrorMessage", () => {
  it("returns Error instance message", () => {
    expect(getErrorMessage(new Error("Something broke"))).toBe("Something broke");
  });

  it("returns stringified primitive", () => {
    expect(getErrorMessage("just a string")).toBe("just a string");
    expect(getErrorMessage(42)).toBe("42");
  });

  it("returns fallback for null", () => {
    expect(getErrorMessage(null)).toBe("null");
  });

  it("returns undefined as string", () => {
    expect(getErrorMessage(undefined)).toBe("undefined");
  });

  it("returns custom fallback", () => {
    expect(getErrorMessage(null, "Oops")).toBe("null");
  });

  it("handles Error with empty message", () => {
    expect(getErrorMessage(new Error(""))).toBe("");
  });

  it("handles object with custom toString", () => {
    const obj = { toString: () => "custom string" };
    expect(getErrorMessage(obj)).toBe("custom string");
  });

  it("handles object without custom toString", () => {
    const obj = { foo: "bar" };
    expect(getErrorMessage(obj)).toBe("[object Object]");
  });
});

describe("getErrorCode", () => {
  it("returns code from object with code property", () => {
    expect(getErrorCode({ code: 11000 })).toBe(11000);
  });

  it("returns undefined for primitive values", () => {
    expect(getErrorCode("error")).toBeUndefined();
    expect(getErrorCode(42)).toBeUndefined();
  });

  it("returns undefined for object without code property", () => {
    expect(getErrorCode({ message: "error" })).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(getErrorCode(null)).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(getErrorCode(undefined)).toBeUndefined();
  });
});
