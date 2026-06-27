import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { Pagination } from "../../core/utils/pagination";
import { LeadsService } from "./leads.service";

export const LeadsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = { ...req.query } as unknown as { status?: string; assignedAgentId?: string; q?: string; page: number; limit: number };
    if (req.user!.role === "agent") {
      query.assignedAgentId = req.user!.id;
    }
    const { page, limit } = query;
    const { data, total } = await LeadsService.list(query, req.user!.agencyId);
    res.json(success(data, Pagination.meta(page, limit, total)));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const lead = await LeadsService.getById(String(req.params.id), req.user!.agencyId);
    if (!lead) throw NotFoundError("Lead");
    if (req.user!.role === "agent" && lead.assignedAgentId?.toString() !== req.user!.id) throw NotFoundError("Lead");
    res.json(success(lead));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const lead = await LeadsService.create({ ...req.body, agencyId: req.user!.agencyId });
    res.status(201).json(success(lead));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const lead = await LeadsService.update(String(req.params.id), req.user!.agencyId, req.body);
    if (!lead) throw NotFoundError("Lead");
    res.json(success(lead));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await LeadsService.delete(String(req.params.id), req.user!.agencyId);
    if (!deleted) throw NotFoundError("Lead");
    res.json(success({ deleted: true }));
  }),
};
