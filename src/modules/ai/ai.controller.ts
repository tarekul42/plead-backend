import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { AiService } from "./ai.service";

export const AiController = {
  matchLeadProperties: asyncHandler(async (req: Request, res: Response) => {
    const { leadId, propertyIds } = req.body;
    const result = await AiService.matchLeadProperties(leadId, propertyIds, req.user!.id, req.user!.agencyId);
    res.json(success(result));
  }),

  generatePropertyDescription: asyncHandler(async (req: Request, res: Response) => {
    const { propertyId, tone } = req.body;
    const result = await AiService.generatePropertyDescription(propertyId, tone, req.user!.id, req.user!.agencyId);
    res.json(success(result));
  }),

  generateOutreachEmail: asyncHandler(async (req: Request, res: Response) => {
    const { leadId, propertyId, tone } = req.body;
    const result = await AiService.generateOutreachEmail(leadId, propertyId, tone, req.user!.id, req.user!.agencyId);
    res.json(success(result));
  }),

  getUsage: asyncHandler(async (req: Request, res: Response) => {
    const usage = await AiService.getUsage(req.user!.agencyId, req.user!.id, req.user!.role);
    res.json(success(usage));
  }),
};
