import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { Pagination } from "../../core/utils/pagination";
import { InteractionsService } from "./interactions.service";

export const InteractionsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 50, 100);
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const leadId = typeof req.query.leadId === "string" ? req.query.leadId : undefined;
    const startDate = typeof req.query.startDate === "string" ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === "string" ? req.query.endDate : undefined;
    const { data, total } =
      req.user!.role === "agent"
        ? await InteractionsService.listByUser(
            req.user!.id,
            req.user!.agencyId,
            page,
            limit,
            type,
            startDate,
            endDate,
          )
        : await InteractionsService.listByAgency(
            req.user!.agencyId,
            page,
            limit,
            type,
            leadId,
            startDate,
            endDate,
          );
    res.json(success(data, Pagination.meta(page, limit, total)));
  }),

  listByLead: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 50, 100);
    const { data, total } = await InteractionsService.listByLead(
      String(req.params.leadId),
      req.user!.agencyId,
      page,
      limit,
    );
    res.json(success(data, Pagination.meta(page, limit, total)));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const interaction = await InteractionsService.create({
      ...req.body,
      leadId: String(req.params.leadId),
      agencyId: req.user!.agencyId,
      performedById: req.user!.id,
    });
    res.status(201).json(success(interaction));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const interaction = await InteractionsService.update(
      String(req.params.id),
      req.user!.agencyId,
      req.user!.id,
      req.user!.role,
      req.body,
    );
    if (!interaction) throw NotFoundError("Interaction");
    res.json(success(interaction));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await InteractionsService.delete(
      String(req.params.id),
      req.user!.agencyId,
      req.user!.id,
      req.user!.role,
    );
    if (!deleted) throw NotFoundError("Interaction");
    res.json(success({ deleted: true }));
  }),
};
