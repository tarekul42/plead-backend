import {
  AppError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
  RateLimitError,
  InternalError,
} from "../../utils/app-error";

describe("app-error", () => {
  describe("AppError", () => {
    it("is an instance of Error", () => {
      const err = new AppError(400, "BAD_REQUEST", "Bad");
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(AppError);
    });

    it("sets name to AppError", () => {
      expect(new AppError(400, "CODE", "msg").name).toBe("AppError");
    });

    it("stores statusCode, code, message, and details", () => {
      const details = { field: "email" };
      const err = new AppError(422, "VALIDATION_ERROR", "failed", details);
      expect(err.statusCode).toBe(422);
      expect(err.code).toBe("VALIDATION_ERROR");
      expect(err.message).toBe("failed");
      expect(err.details).toEqual(details);
    });

    it("has undefined details when not provided", () => {
      const err = new AppError(500, "INTERNAL_ERROR", "oops");
      expect(err.details).toBeUndefined();
    });

    it("message is inherited from Error", () => {
      const err = new AppError(400, "CODE", "my message");
      expect(err.message).toBe("my message");
    });
  });

  describe("NotFoundError", () => {
    it("creates a 404 NOT_FOUND error", () => {
      const err = NotFoundError("Property");
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe("NOT_FOUND");
      expect(err.message).toBe("Property not found");
    });

    it("embeds the resource name in the message", () => {
      expect(NotFoundError("User").message).toBe("User not found");
      expect(NotFoundError("Lead").message).toBe("Lead not found");
    });
  });

  describe("ForbiddenError", () => {
    it("creates a 403 FORBIDDEN error with default message", () => {
      const err = ForbiddenError();
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe("FORBIDDEN");
      expect(err.message).toBe("Forbidden");
    });

    it("accepts a custom message", () => {
      const err = ForbiddenError("No access");
      expect(err.message).toBe("No access");
    });
  });

  describe("UnauthorizedError", () => {
    it("creates a 401 UNAUTHORIZED error with default message", () => {
      const err = UnauthorizedError();
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe("UNAUTHORIZED");
      expect(err.message).toBe("Unauthorized");
    });

    it("accepts a custom message", () => {
      const err = UnauthorizedError("Token expired");
      expect(err.message).toBe("Token expired");
    });
  });

  describe("ValidationError", () => {
    it("creates a 422 VALIDATION_ERROR with default message", () => {
      const details = [{ path: ["email"], message: "required" }];
      const err = ValidationError(details);
      expect(err.statusCode).toBe(422);
      expect(err.code).toBe("VALIDATION_ERROR");
      expect(err.message).toBe("Validation failed");
      expect(err.details).toEqual(details);
    });
  });

  describe("RateLimitError", () => {
    it("creates a 429 RATE_LIMITED error", () => {
      const err = RateLimitError();
      expect(err.statusCode).toBe(429);
      expect(err.code).toBe("RATE_LIMITED");
      expect(err.message).toBe("Too many requests");
    });
  });

  describe("InternalError", () => {
    it("creates a 500 INTERNAL_ERROR with default message", () => {
      const err = InternalError();
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe("INTERNAL_ERROR");
      expect(err.message).toBe("Internal error");
    });

    it("accepts a custom message", () => {
      const err = InternalError("DB down");
      expect(err.message).toBe("DB down");
    });
  });
});
