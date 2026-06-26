import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
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
  return res.status(500).json(error("INTERNAL_ERROR", "Something went wrong"));
};
