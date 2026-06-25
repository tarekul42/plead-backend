import { Router } from "express";
import { AgenciesController } from "./agencies.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createAgencySchema, updateAgencySchema, agencyParamSchema } from "./agencies.validation";

const agenciesRouter = Router();

agenciesRouter.post("/", validate(createAgencySchema), AgenciesController.create);
agenciesRouter.get("/:id", validate(agencyParamSchema, "params"), AgenciesController.getById);
agenciesRouter.patch("/:id", requireAuth, StrictRole("admin"), validate(updateAgencySchema), validate(agencyParamSchema, "params"), AgenciesController.update);

export { agenciesRouter };
