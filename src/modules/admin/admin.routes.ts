import { Router } from "express";
import { AdminController } from "./admin.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";

const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(StrictRole("admin"));

adminRouter.get("/stats/platform", AdminController.getPlatformStats);
adminRouter.get("/stats/agency", AdminController.getAgencyStats);
adminRouter.get("/users", AdminController.listUsers);
adminRouter.patch("/users/:id/toggle-status", AdminController.toggleUserStatus);
adminRouter.get("/ai-analytics", AdminController.getAiAnalytics);

export { adminRouter };
