import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { ReviewsService } from "./reviews.service";

export const ReviewsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const filter: Record<string, unknown> = {};
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === "true";
    const reviews = await ReviewsService.listByAgency(req.user!.agencyId, filter);
    res.json(success(reviews));
  }),

  listByProperty: asyncHandler(async (req: Request, res: Response) => {
    const reviews = await ReviewsService.listByProperty(String(req.params.propertyId), req.user!.agencyId);
    res.json(success(reviews));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await ReviewsService.create({
      ...req.body,
      propertyId: String(req.params.propertyId),
      agencyId: req.user!.agencyId,
      userId: req.user!.id,
    });
    res.status(201).json(success(review));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const review = await ReviewsService.update(String(req.params.id), req.user!.agencyId, req.body);
    if (!review) throw NotFoundError("Review");
    res.json(success(review));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await ReviewsService.delete(String(req.params.id), req.user!.agencyId);
    if (!deleted) throw NotFoundError("Review");
    res.json(success({ deleted: true }));
  }),
};
