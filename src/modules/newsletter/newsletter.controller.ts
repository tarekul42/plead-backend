import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NewsletterService } from "./newsletter.service";

export const NewsletterController = {
  subscribe: asyncHandler(async (req: Request, res: Response) => {
    const result = await NewsletterService.subscribe(req.body.email);
    res.status(201).json(success(result));
  }),
};
