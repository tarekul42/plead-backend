import { Request, Response } from "express";
import { asyncHandler } from "../async-handler";

describe("asyncHandler", () => {
  it("calls next when handler throws", async () => {
    const handler = asyncHandler(async (_req: Request, _res: Response) => {
      throw new Error("something broke");
    });
    const req = {} as Request;
    const res = {} as Response;
    const next = jest.fn();

    await handler(req, res, next);
    expect(next).toHaveBeenCalledWith(new Error("something broke"));
  });

  it("passes through when handler succeeds", async () => {
    const handler = asyncHandler(async (_req: Request, res: Response) => {
      res.json({ ok: true });
    });
    const req = {} as Request;
    const res = { json: jest.fn() } as unknown as Response;
    const next = jest.fn();

    await handler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });
});
