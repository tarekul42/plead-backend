import { Request, Response } from "express";
import { error } from "../utils/api-response";

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json(error("NOT_FOUND", "Route not found"));
};
