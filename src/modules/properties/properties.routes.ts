import { Router } from "express";
import { PropertiesController } from "./properties.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createPropertySchema, updatePropertySchema, listPropertiesQuerySchema } from "./properties.validation";

const propertiesRouter = Router();

propertiesRouter.get("/", validate(listPropertiesQuerySchema, "query"), PropertiesController.list);
propertiesRouter.get("/:slug", PropertiesController.getBySlug);
propertiesRouter.get("/:id/related", PropertiesController.related);
propertiesRouter.post("/", requireAuth, StrictRole("manager", "admin"), validate(createPropertySchema), PropertiesController.create);
propertiesRouter.patch("/:id", requireAuth, StrictRole("manager", "admin"), validate(updatePropertySchema), PropertiesController.update);
propertiesRouter.delete("/:id", requireAuth, StrictRole("manager", "admin"), PropertiesController.delete);

export { propertiesRouter };
