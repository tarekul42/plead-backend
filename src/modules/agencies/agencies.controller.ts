import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { AgenciesService } from "./agencies.service";

export const AgenciesController = {
  getById: asyncHandler(async (req: Request, res: Response) => {
    const agency = await AgenciesService.getById(req.params.id);
    if (!agency) throw NotFoundError("Agency");
    res.json(success(agency));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const agency = await AgenciesService.create(req.body);
    res.status(201).json(success(agency));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const agency = await AgenciesService.update(req.params.id, req.body);
    if (!agency) throw NotFoundError("Agency");
    res.json(success(agency));
  }),
};
