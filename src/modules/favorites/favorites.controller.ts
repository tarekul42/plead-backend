import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { Pagination } from "../../core/utils/pagination";
import { FavoritesService } from "./favorites.service";

export const FavoritesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 20);
    const result = await FavoritesService.list(req.user!.id, page, limit);
    res.json(success(result.data, Pagination.meta(page, limit, result.total)));
  }),

  add: asyncHandler(async (req: Request, res: Response) => {
    const favorite = await FavoritesService.add(
      req.user!.id,
      req.body.propertyId,
      req.user!.agencyId,
    );
    res.status(201).json(success(favorite));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await FavoritesService.remove(req.user!.id, req.params.propertyId);
    res.json(success({ deleted: true }));
  }),

  check: asyncHandler(async (req: Request, res: Response) => {
    const result = await FavoritesService.check(req.user!.id, req.params.propertyId);
    res.json(success(result));
  }),
};
