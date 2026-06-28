import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { Pagination } from "../../core/utils/pagination";
import { UsersService } from "./users.service";

export const UsersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 50, 100);
    const { data, total } = await UsersService.listByAgency(req.user!.agencyId, page, limit);
    res.json(success(data, Pagination.meta(page, limit, total)));
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.getById(req.user!.id);
    res.json(success(user));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.getById(String(req.params.id));
    if (!user || String(user.agencyId) !== req.user!.agencyId) throw NotFoundError("User");
    res.json(success(user));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await UsersService.updateById(
      String(req.params.id),
      req.user!.agencyId,
      req.body,
    );
    if (!updated) throw NotFoundError("User");
    res.json(success(updated));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.getById(String(req.params.id));
    if (!user || String(user.agencyId) !== req.user!.agencyId) throw NotFoundError("User");
    await UsersService.update(user.clerkId, { isActive: false });
    res.json(success({ deleted: true }));
  }),
};
