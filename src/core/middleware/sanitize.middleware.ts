import type { Request, Response, NextFunction } from "express";

function sanitize(obj: Record<string, unknown>): void {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$")) {
      delete obj[key];
    } else if (["__proto__", "constructor", "prototype"].includes(key)) {
      delete obj[key];
    } else if (Array.isArray(obj[key])) {
      for (let i = 0; i < (obj[key] as unknown[]).length; i++) {
        if (typeof (obj[key] as unknown[])[i] === "object" && (obj[key] as unknown[])[i] !== null) {
          sanitize((obj[key] as unknown[])[i] as Record<string, unknown>);
        }
      }
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitize(obj[key] as Record<string, unknown>);
    }
  }
}

export const sanitizeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    sanitize(req.body as Record<string, unknown>);
  }
  if (req.query && typeof req.query === "object") {
    sanitize(req.query as Record<string, unknown>);
  }
  if (req.params && typeof req.params === "object") {
    sanitize(req.params as Record<string, unknown>);
  }
  next();
};
