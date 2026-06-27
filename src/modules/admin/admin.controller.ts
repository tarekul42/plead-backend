import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { Pagination } from "../../core/utils/pagination";
import { AdminService } from "./admin.service";
import { ROLES } from "../../core/constants";
import { clerkClient } from "@clerk/express";

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
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ success: false, error: { code: "SELF_DEACTIVATE", message: "Cannot deactivate yourself" } });
    }
    const user = await AdminService.toggleUserStatus(String(req.params.id), req.user!.agencyId);
    if (!user) throw NotFoundError("User");
    res.json(success(user));
  }),

  changeRole: asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const roleStr: string = typeof req.body.role === "string" ? req.body.role : "";
    if (!(ROLES as readonly string[]).includes(roleStr)) {
      return res.status(400).json({ success: false, error: { code: "INVALID_ROLE", message: `Role must be one of: ${ROLES.join(", ")}` } });
    }
    const user = await AdminService.changeRole(id, req.user!.agencyId, roleStr);
    if (!user) throw NotFoundError("User");
    res.json(success({ _id: user._id, role: user.role, new: roleStr }));
  }),

  getAiAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const analytics = await AdminService.getRecentAiAnalytics(
      req.user!.agencyId,
      Math.min(Number(req.query.limit) || 20, 100),
    );
    res.json(success(analytics));
  }),
};
