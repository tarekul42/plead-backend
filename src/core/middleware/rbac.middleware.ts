import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/app-error";

export const StrictRole = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ForbiddenError("Not authenticated"));
    if (!roles.includes(req.user.role)) return next(ForbiddenError("Insufficient role"));
    next();
  };
