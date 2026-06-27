jest.mock("../../utils/logger", () => ({
  logger: { error: jest.fn() },
}));

jest.mock("mongoose", () => {
  class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ValidationError";
    }
  }
  class CastError extends Error {
    path: string;
    value: unknown;
    constructor(type: string, value: unknown, path: string) {
      super(`Cast to ${type} failed for value "${value}" at path "${path}"`);
      this.name = "CastError";
      this.path = path;
      this.value = value;
    }
  }
  const ErrorNamespace = { ValidationError, CastError };
  return { Error: ErrorNamespace };
});

import { ZodError, z } from "zod";
import { errorHandler } from "../../middleware/error-handler.middleware";
import { AppError, NotFoundError, ValidationError as AppValidationError } from "../../utils/app-error";
import mongoose from "mongoose";

function makeZodError(): ZodError {
  const schema = z.object({ name: z.string().min(1) });
  const result = schema.safeParse({ name: "" });
  if (result.success) throw new Error("expected failure");
  return result.error;
}

describe("error-handler middleware", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { path: "/api/test" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it("logs the error and request path", () => {
    const { logger } = require("../../utils/logger");
    const err = new Error("boom");
    errorHandler(err, req, res, jest.fn());
    expect(logger.error).toHaveBeenCalledWith({ err, path: "/api/test" }, "Request error");
  });

  describe("AppError handling", () => {
    it("returns the AppError status code and body", () => {
      const err = NotFoundError("Property");
      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "NOT_FOUND", message: "Property not found" },
      });
    });

    it("includes details when present", () => {
      const err = AppValidationError({ field: "email" });
      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Validation failed", details: { field: "email" } },
      });
    });
  });

  describe("ZodError handling", () => {
    it("returns 422 with the zod issues as details", () => {
      const err = makeZodError();
      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Validation failed", details: err.issues },
      });
    });
  });

  describe("MulterError handling", () => {
    it("returns 400 with an UPLOAD_ERROR code", () => {
      const err = new Error("File too large");
      err.name = "MulterError";
      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "UPLOAD_ERROR", message: "File too large" },
      });
    });
  });

  describe("mongoose ValidationError handling", () => {
    it("returns 400 with a VALIDATION_ERROR code", () => {
      // Build a structurally-compatible mongoose ValidationError.
      const err = Object.create(mongoose.Error.ValidationError.prototype);
      err.message = "bad schema";
      err.name = "ValidationError";
      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "bad schema" },
      });
    });
  });

  describe("mongoose CastError handling", () => {
    it("returns 400 with an INVALID_ID code", () => {
      const err = new mongoose.Error.CastError("ObjectId", "not-an-id", "_id");
      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid _id: not-an-id" },
      });
    });
  });

  describe("duplicate key handling", () => {
    it("returns 409 with the first duplicate field (code 11000)", () => {
      const err = { code: 11000, keyValue: { email: "a@b.com" } };
      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "DUPLICATE_KEY", message: "Duplicate value for email" },
      });
    });

    it("handles code 11001 the same way", () => {
      const err = { code: 11001, keyValue: { slug: "dup" } };
      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "DUPLICATE_KEY", message: "Duplicate value for slug" },
      });
    });

    it("falls back to 'field' when keyValue is missing", () => {
      const err = { code: 11000 };
      errorHandler(err, req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "DUPLICATE_KEY", message: "Duplicate value for field" },
      });
    });

    it("falls back to 'field' when keyValue has no keys", () => {
      const err = { code: 11000, keyValue: {} };
      errorHandler(err, req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "DUPLICATE_KEY", message: "Duplicate value for field" },
      });
    });
  });

  describe("SyntaxError with body handling", () => {
    it("returns 400 for a SyntaxError that has a body property", () => {
      const err = new SyntaxError("Unexpected token");
      (err as any).body = "raw body";
      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "INVALID_JSON", message: "Malformed JSON in request body" },
      });
    });
  });

  describe("fallback handling", () => {
    it("returns 500 for an unknown error", () => {
      errorHandler(new Error("unexpected"), req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      });
    });

    it("returns 500 for a SyntaxError without a body property", () => {
      errorHandler(new SyntaxError("oops"), req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("returns 500 for a plain object error", () => {
      errorHandler({ foo: "bar" }, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
