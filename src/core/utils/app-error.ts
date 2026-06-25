export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: object,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const NotFoundError = (resource: string) =>
  new AppError(404, "NOT_FOUND", `${resource} not found`);

export const ForbiddenError = (msg = "Forbidden") =>
  new AppError(403, "FORBIDDEN", msg);

export const UnauthorizedError = (msg = "Unauthorized") =>
  new AppError(401, "UNAUTHORIZED", msg);

export const ValidationError = (details: object) =>
  new AppError(422, "VALIDATION_ERROR", "Validation failed", details);

export const RateLimitError = () =>
  new AppError(429, "RATE_LIMITED", "Too many requests");
