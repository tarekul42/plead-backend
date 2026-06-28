import type { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS: string[] = [];
const STRING_FIELDS = [
  "title",
  "description",
  "name",
  "notes",
  "comment",
  "content",
  "excerpt",
  "message",
  "subject",
  "outcome",
  "address",
  "location",
];

function sanitizeValue(val: unknown, depth = 0): unknown {
  if (depth > 10) return val;
  if (typeof val === "string") {
    return sanitizeHtml(val, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {},
      disallowedTagsMode: "recursiveEscape",
    }).trim();
  }
  if (Array.isArray(val)) {
    return val.map((v) => sanitizeValue(v, depth + 1));
  }
  if (val && typeof val === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (STRING_FIELDS.includes(k) && typeof v === "string") {
        sanitized[k] = sanitizeValue(v, depth + 1) as string;
      } else if (typeof v === "object" && v !== null) {
        sanitized[k] = sanitizeValue(v, depth + 1);
      } else {
        sanitized[k] = v;
      }
    }
    return sanitized;
  }
  return val;
}

export const xssSanitizeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body) as Record<string, unknown>;
  }
  next();
};
