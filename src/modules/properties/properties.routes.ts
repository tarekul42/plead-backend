import { Router } from "express";
import { PropertiesController } from "./properties.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import {
  createPropertySchema,
  updatePropertySchema,
  listPropertiesQuerySchema,
  propertyParamSchema,
  propertySlugParamSchema,
} from "./properties.validation";

const propertiesRouter = Router();

propertiesRouter.get("/", validate(listPropertiesQuerySchema, "query"), PropertiesController.list);
propertiesRouter.get(
  "/id/:id",
  validate(propertyParamSchema, "params"),
  PropertiesController.getById,
);
propertiesRouter.get(
  "/:id/related",
  validate(propertyParamSchema, "params"),
  PropertiesController.related,
);
propertiesRouter.get(
  "/:slug",
  validate(propertySlugParamSchema, "params"),
  PropertiesController.getBySlug,
);
propertiesRouter.post(
  "/",
  requireAuth,
  StrictRole("manager", "admin"),
  validate(createPropertySchema),
  PropertiesController.create,
);
propertiesRouter.patch(
  "/:id",
  requireAuth,
  StrictRole("manager", "admin"),
  validate(updatePropertySchema),
  validate(propertyParamSchema, "params"),
  PropertiesController.update,
);
propertiesRouter.delete(
  "/:id",
  requireAuth,
  StrictRole("manager", "admin"),
  validate(propertyParamSchema, "params"),
  PropertiesController.delete,
);

export { propertiesRouter };
