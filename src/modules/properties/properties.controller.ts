import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { PropertiesService } from "./properties.service";

export const PropertiesController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { data, total } = await PropertiesService.list(req.query as any, req.user!.agencyId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    res.json(success(data, { page, limit, total }));
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertiesService.getBySlugPublic(req.params.slug);
    if (!property) throw NotFoundError("Property");
    res.json(success(property));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertiesService.create({ ...req.body, agencyId: req.user!.agencyId });
    res.status(201).json(success(property));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertiesService.update(req.params.id, req.user!.agencyId, req.body);
    if (!property) throw NotFoundError("Property");
    res.json(success(property));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await PropertiesService.delete(req.params.id, req.user!.agencyId);
    if (!deleted) throw NotFoundError("Property");
    res.json(success({ deleted: true }));
  }),

  related: asyncHandler(async (req: Request, res: Response) => {
    const related = await PropertiesService.getRelated(req.params.id, req.user!.agencyId);
    res.json(success(related));
  }),
};
