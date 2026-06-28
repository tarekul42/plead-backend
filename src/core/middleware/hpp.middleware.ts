import hpp from "hpp";
import type { Request, Response, NextFunction } from "express";

const WHITELISTED_PARAMS = ["sort", "page", "limit", "price", "beds", "baths", "area"];

export const hppMiddleware = hpp({
  whitelist: WHITELISTED_PARAMS,
});
