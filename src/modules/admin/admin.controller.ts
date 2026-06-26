import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { Pagination } from "../../core/utils/pagination";
import { AdminService } from "./admin.service";

export const AdminController = {
  getAgencyStats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await AdminService.getAgencyStats(req.user!.agencyId);
    res.json(success(stats));
  }),

  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 50, 100);
    const { data, total } = await AdminService.listUsers(req.user!.agencyId, page, limit);
    res.json(success(data, Pagination.meta(page, limit, total)));
  }),

  toggleUserStatus: asyncHandler(async (req: Request, res: Response) => {
    const user = await AdminService.toggleUserStatus(String(req.params.id), req.user!.agencyId);
    if (!user) throw NotFoundError("User");
    res.json(success(user));
  }),

  getAiAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const analytics = await AdminService.getRecentAiAnalytics(
      req.user!.agencyId,
      Number(req.query.limit) || 20,
    );
    res.json(success(analytics));
  }),
};
