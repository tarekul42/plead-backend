import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { ContactService } from "./contact.service";

export const ContactController = {
  submit: asyncHandler(async (req: Request, res: Response) => {
    const contact = await ContactService.create(req.body);
    res.status(201).json(success(contact));
  }),
};
