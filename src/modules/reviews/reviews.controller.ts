import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { Pagination } from "../../core/utils/pagination";
import { ReviewsService } from "./reviews.service";

export const ReviewsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 50, 100);
    const { data, total } = await ReviewsService.listByAgency(
      req.user!.agencyId,
      typeof req.query.isVerified === "string" ? req.query.isVerified : undefined,
      page,
      limit,
    );
    res.json(success(data, Pagination.meta(page, limit, total)));
  }),

  listByProperty: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 50, 100);
    const { data, total } = await ReviewsService.listByProperty(
      String(req.params.propertyId), req.user!.agencyId, page, limit,
    );
    res.json(success(data, Pagination.meta(page, limit, total)));
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
    const review = await ReviewsService.update(String(req.params.id), req.user!.agencyId, req.user!.id, req.user!.role, req.body);
    if (!review) throw NotFoundError("Review");
    res.json(success(review));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await ReviewsService.delete(String(req.params.id), req.user!.agencyId, req.user!.id, req.user!.role);
    if (!deleted) throw NotFoundError("Review");
    res.json(success({ deleted: true }));
  }),
};
