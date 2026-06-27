import { asyncHandler } from "../../utils/async-handler";

describe("async-handler", () => {
  it("returns a function", () => {
    const handler = asyncHandler(async () => {});
    expect(typeof handler).toBe("function");
    expect(handler.length).toBe(3); // (req, res, next)
  });

  it("calls next with the resolved value's error on rejection", async () => {
    const thrown = new Error("boom");
    const fn = async () => {
      throw thrown;
    };
    const next = jest.fn();
    const req = {} as never;
    const res = {} as never;

    await asyncHandler(fn)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(thrown);
  });

  it("does not call next when the handler resolves", async () => {
    const fn = async () => "ok";
    const next = jest.fn();
    const req = {} as never;
    const res = {} as never;

    await asyncHandler(fn)(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });

  it("wraps a non-promise return value in a resolved promise", async () => {
    const fn = () => "sync-value";
    const next = jest.fn();
    const req = {} as never;
    const res = {} as never;

    await asyncHandler(fn as never)(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });

  it("passes req, res, next to the wrapped function", async () => {
    const fn = jest.fn(async () => "ok");
    const req = { method: "GET" } as never;
    const res = { status: jest.fn() } as never;
    const next = jest.fn();

    await asyncHandler(fn)(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
  });

  it("does not catch errors thrown synchronously before the promise", () => {
    const thrown = new Error("sync-boom");
    const fn = () => {
      throw thrown;
    };
    const next = jest.fn();

    // The synchronous throw happens during fn(...) evaluation, before
    // Promise.resolve wraps it, so it propagates out of asyncHandler.
    expect(() => asyncHandler(fn as never)({} as never, {} as never, next)).toThrow(
      "sync-boom",
    );
    expect(next).not.toHaveBeenCalled();
  });
});
