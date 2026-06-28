import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "../utils/app-error";
import { error } from "../utils/api-response";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error({ err, path: req.path }, "Request error");

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(error(err.code, err.message, err.details));
  }
  if (err instanceof ZodError) {
    return res.status(422).json(error("VALIDATION_ERROR", "Validation failed", err.issues));
  }
  if (err.name === "MulterError") {
    return res.status(400).json(error("UPLOAD_ERROR", err.message));
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json(error("VALIDATION_ERROR", err.message));
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json(error("INVALID_ID", `Invalid ${err.path}: ${err.value}`));
  }
  if (err.code === 11000 || err.code === 11001) {
    const keyValue = (err as Record<string, unknown>).keyValue;
    const keys =
      keyValue && typeof keyValue === "object"
        ? Object.keys(keyValue as Record<string, unknown>)
        : [];
    const field = keys.length > 0 ? keys[0] : "field";
    return res.status(409).json(error("DUPLICATE_KEY", `Duplicate value for ${field}`));
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json(error("INVALID_JSON", "Malformed JSON in request body"));
  }
  return res.status(500).json(error("INTERNAL_ERROR", "Something went wrong"));
};
