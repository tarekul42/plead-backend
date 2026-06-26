import { Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { errorHandler } from "../error-handler.middleware";
import { NotFoundError } from "../../utils/app-error";

function mockReq(path = "/test") {
  return { path } as Request;
}

function mockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("errorHandler", () => {
  it("handles AppError with correct status code", () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = NotFoundError("User");
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "NOT_FOUND", message: "User not found" },
    });
  });

  it("handles ZodError with 422", () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = new ZodError([{ code: "invalid_type", expected: "string", path: ["name"], message: "Required" }]);
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  it("handles MulterError with 400", () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = new Error("File too large");
    err.name = "MulterError";
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "UPLOAD_ERROR", message: "File too large" },
    });
  });

  it("handles Mongoose ValidationError with 400", () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = new mongoose.Error.ValidationError();
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("handles Mongoose CastError with 400", () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = new mongoose.Error.CastError("ObjectId", "bad-id", "_id");
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "INVALID_ID", message: "Invalid _id: bad-id" },
    });
  });

  it("handles duplicate key error (11000) with 409", () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = new Error("E11000 duplicate key");
    (err as any).code = 11000;
    (err as any).keyValue = { email: "test@test.com" };
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "DUPLICATE_KEY", message: "Duplicate value for email" },
    });
  });

  it("handles duplicate key error (11001) with 409", () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = new Error("E11001 duplicate key");
    (err as any).code = 11001;
    (err as any).keyValue = { email: "test@test.com" };
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("handles duplicate key error with null keyValue", async () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = new Error("E11000 duplicate key");
    (err as any).code = 11000;
    (err as any).keyValue = null;
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "DUPLICATE_KEY", message: "Duplicate value for field" },
    });
  });

  it("handles duplicate key error with empty keyValue", async () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = new Error("E11000 duplicate key");
    (err as any).code = 11000;
    (err as any).keyValue = {};
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "DUPLICATE_KEY", message: "Duplicate value for field" },
    });
  });

  it("handles SyntaxError (malformed JSON) with 400", () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = new SyntaxError("Unexpected token");
    (err as any).body = true;
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("handles unknown error with 500", () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    const err = new Error("Something random");
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
    });
  });
});
