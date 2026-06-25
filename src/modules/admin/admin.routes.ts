import { Router } from "express";
import { AdminController } from "./admin.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { objectId } from "../../core/utils/validation";
import { z } from "zod";

const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(StrictRole("admin"));

adminRouter.get("/stats/platform", AdminController.getPlatformStats);
adminRouter.get("/stats/agency", AdminController.getAgencyStats);
adminRouter.get("/users", AdminController.listUsers);
adminRouter.patch("/users/:id/toggle-status", validate(z.object({ id: objectId }), "params"), AdminController.toggleUserStatus);
adminRouter.get("/ai-analytics", AdminController.getAiAnalytics);

export { adminRouter };
