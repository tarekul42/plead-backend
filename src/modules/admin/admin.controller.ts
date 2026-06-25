import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { AdminService } from "./admin.service";

export const AdminController = {
  getPlatformStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await AdminService.getPlatformStats();
    res.json(success(stats));
  }),

  getAgencyStats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await AdminService.getAgencyStats(req.user!.agencyId);
    res.json(success(stats));
  }),

  listUsers: asyncHandler(async (_req: Request, res: Response) => {
    const users = await AdminService.listUsers();
    res.json(success(users));
  }),

  toggleUserStatus: asyncHandler(async (req: Request, res: Response) => {
    const user = await AdminService.toggleUserStatus(String(req.params.id));
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
