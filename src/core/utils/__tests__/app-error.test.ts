import { AppError, NotFoundError, ForbiddenError, UnauthorizedError, ValidationError, RateLimitError, InternalError } from "../app-error";

describe("AppError", () => {
  it("creates an error with statusCode, code, and message", () => {
    const err = new AppError(400, "BAD_REQUEST", "Something is wrong");
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Something is wrong");
    expect(err.name).toBe("AppError");
  });

  it("accepts optional details", () => {
    const details = { field: "email" };
    const err = new AppError(422, "VALIDATION", "Invalid", details);
    expect(err.details).toEqual(details);
  });
});

describe("NotFoundError", () => {
  it("creates a 404 error with resource name", () => {
    const err = NotFoundError("User");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("User not found");
  });
});

describe("ForbiddenError", () => {
  it("creates a 403 error", () => {
    const err = ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Forbidden");
  });

  it("accepts custom message", () => {
    const err = ForbiddenError("Insufficient role");
    expect(err.message).toBe("Insufficient role");
  });
});

describe("UnauthorizedError", () => {
  it("creates a 401 error", () => {
    const err = UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });
});

describe("ValidationError", () => {
  it("creates a 422 error with details", () => {
    const details = { issues: [{ path: "email", message: "Invalid email" }] };
    const err = ValidationError(details);
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toBe(details);
  });
});

describe("RateLimitError", () => {
  it("creates a 429 error", () => {
    const err = RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMITED");
  });
});

describe("InternalError", () => {
  it("creates a 500 error", () => {
    const err = InternalError();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.message).toBe("Internal error");
  });

  it("accepts custom message", () => {
    const err = InternalError("DB connection failed");
    expect(err.message).toBe("DB connection failed");
  });
});
