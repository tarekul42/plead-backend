import { Router } from "express";
import { LeadsController } from "./leads.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createLeadSchema, updateLeadSchema, listLeadsQuerySchema, leadParamSchema } from "./leads.validation";

const leadsRouter = Router();

leadsRouter.use(requireAuth);

leadsRouter.get("/stats", LeadsController.stats);
leadsRouter.get("/", validate(listLeadsQuerySchema, "query"), LeadsController.list);
leadsRouter.get("/:id", validate(leadParamSchema, "params"), LeadsController.getById);
leadsRouter.post("/", StrictRole("agent", "manager", "admin"), validate(createLeadSchema), LeadsController.create);
leadsRouter.patch("/:id", StrictRole("agent", "manager", "admin"), validate(updateLeadSchema), validate(leadParamSchema, "params"), LeadsController.update);
leadsRouter.delete("/:id", StrictRole("manager", "admin"), validate(leadParamSchema, "params"), LeadsController.delete);

export { leadsRouter };
