import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { Pagination } from "../../core/utils/pagination";
import { AgenciesService } from "./agencies.service";

export const AgenciesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 20, 100);
    const { data, total } = await AgenciesService.list(req.user!.agencyId, page, limit);
    res.json(success(data, Pagination.meta(page, limit, total)));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const agency = await AgenciesService.getById(String(req.params.id), req.user!.agencyId);
    if (!agency) throw NotFoundError("Agency");
    res.json(success(agency));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const agency = await AgenciesService.create(req.body);
    res.status(201).json(success(agency));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const agency = await AgenciesService.update(
      String(req.params.id),
      req.user!.agencyId,
      req.body,
    );
    if (!agency) throw NotFoundError("Agency");
    res.json(success(agency));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await AgenciesService.delete(String(req.params.id), req.user!.agencyId);
    if (!deleted) throw NotFoundError("Agency");
    res.json(success({ deleted: true }));
  }),
};
