import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { Pagination } from "../../core/utils/pagination";
import { PropertiesService } from "./properties.service";
import type { ListQuery } from "./properties.service";

function getAgencyId(req: Request): string {
  return (req.query.agencyId as string) || req.user?.agencyId || "";
}

export const PropertiesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 12);
    const { data, total } = await PropertiesService.list(
      req.query as unknown as ListQuery,
      getAgencyId(req),
    );
    res.json(success(data, Pagination.meta(page, limit, total)));
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertiesService.getBySlug(String(req.params.slug), getAgencyId(req));
    if (!property) throw NotFoundError("Property");
    res.json(success(property));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertiesService.getById(String(req.params.id), getAgencyId(req));
    if (!property) throw NotFoundError("Property");
    res.json(success(property));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertiesService.create({ ...req.body, agencyId: req.user!.agencyId });
    res.status(201).json(success(property));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertiesService.update(
      String(req.params.id),
      req.user!.agencyId,
      req.body,
    );
    if (!property) throw NotFoundError("Property");
    res.json(success(property));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await PropertiesService.delete(String(req.params.id), req.user!.agencyId);
    if (!deleted) throw NotFoundError("Property");
    res.json(success({ deleted: true }));
  }),

  related: asyncHandler(async (req: Request, res: Response) => {
    const related = await PropertiesService.getRelated(String(req.params.id), getAgencyId(req));
    res.json(success(related));
  }),
};
