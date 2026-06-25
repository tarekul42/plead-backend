import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { InteractionsService } from "./interactions.service";

export const InteractionsController = {
  listByLead: asyncHandler(async (req: Request, res: Response) => {
    const interactions = await InteractionsService.listByLead(req.params.leadId, req.user!.agencyId);
    res.json(success(interactions));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const interaction = await InteractionsService.create({
      ...req.body,
      leadId: req.params.leadId,
      agencyId: req.user!.agencyId,
      performedById: req.user!.id,
    });
    res.status(201).json(success(interaction));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const interaction = await InteractionsService.update(req.params.id, req.user!.agencyId, req.body);
    if (!interaction) throw NotFoundError("Interaction");
    res.json(success(interaction));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await InteractionsService.delete(req.params.id, req.user!.agencyId);
    if (!deleted) throw NotFoundError("Interaction");
    res.json(success({ deleted: true }));
  }),
};
