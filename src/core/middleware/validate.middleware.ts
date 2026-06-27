import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { sanitizeObject } from "../utils/sanitize";

function formatZodError(err: ZodError) {
  const fieldErrors = err.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
  return new AppError(422, "VALIDATION_ERROR", "Validation failed", { fields: fieldErrors, message: fieldErrors[0]?.message || "Invalid input" });
}

export const validate = (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (source === "body" && typeof req.body === "object" && req.body !== null) {
      req.body = sanitizeObject(req.body);
    }
    const dataToValidate = req[source];
    const result = schema.safeParse(dataToValidate);
    if (!result.success) return next(formatZodError(result.error));
    
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      enumerable: true,
      configurable: true
    });
    
    next();
  };
