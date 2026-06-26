import { Router } from "express";
import { AgenciesController } from "./agencies.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createAgencySchema, updateAgencySchema, agencyParamSchema } from "./agencies.validation";

const agenciesRouter = Router();

agenciesRouter.get("/", requireAuth, AgenciesController.list);
agenciesRouter.post("/", requireAuth, StrictRole("admin"), validate(createAgencySchema), AgenciesController.create);
agenciesRouter.get("/:id", requireAuth, validate(agencyParamSchema, "params"), AgenciesController.getById);
agenciesRouter.patch("/:id", requireAuth, StrictRole("admin"), validate(agencyParamSchema, "params"), validate(updateAgencySchema), AgenciesController.update);
agenciesRouter.delete("/:id", requireAuth, StrictRole("admin"), validate(agencyParamSchema, "params"), AgenciesController.delete);

export { agenciesRouter };
