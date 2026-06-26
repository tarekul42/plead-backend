import { Request, Response } from "express";
import { z } from "zod";
import { validate } from "../validate.middleware";

function mockReq(body: any = {}, query: any = {}, params: any = {}) {
  return { body, query, params } as Request;
}

function mockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as unknown as Response;
}

describe("validate", () => {
  const schema = z.object({ name: z.string().min(1) });

  it("calls next() when validation passes", () => {
    const req = mockReq({ name: "John" });
    const res = mockRes();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: "John" });
  });

  it("calls next with ValidationError when validation fails", () => {
    const req = mockReq({ name: "" });
    const res = mockRes();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 422, code: "VALIDATION_ERROR" }));
  });

  it("validates query when source is 'query'", () => {
    const req = mockReq({}, { page: "1" });
    const res = mockRes();
    const next = jest.fn();

    validate(z.object({ page: z.string().optional() }), "query")(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("validates params when source is 'params'", () => {
    const req = mockReq({}, {}, { id: "507f1f77bcf86cd799439011" });
    const res = mockRes();
    const next = jest.fn();

    validate(z.object({ id: z.string() }), "params")(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
