import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { UsersService } from "./users.service";

export class UsersController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const users = await UsersService.listByAgency(req.user!.agencyId);
    res.json(success(users));
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.getById(req.user!.id);
    res.json(success(user));
  });
}

export const usersController = new UsersController();
