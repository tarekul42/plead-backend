import { Router } from "express";
import { LeadsController } from "./leads.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createLeadSchema, updateLeadSchema } from "./leads.validation";

const leadsRouter = Router();

leadsRouter.use(requireAuth);

leadsRouter.get("/", LeadsController.list);
leadsRouter.get("/:id", LeadsController.getById);
leadsRouter.post("/", StrictRole("agent", "manager", "admin"), validate(createLeadSchema), LeadsController.create);
leadsRouter.patch("/:id", StrictRole("agent", "manager", "admin"), validate(updateLeadSchema), LeadsController.update);
leadsRouter.delete("/:id", StrictRole("manager", "admin"), LeadsController.delete);

export { leadsRouter };
