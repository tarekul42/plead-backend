import { Request, Response, NextFunction } from "express";

export const tenantScope = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.agencyId) {
    return next(new Error("Missing agencyId on authenticated user"));
  }
  next();
};
