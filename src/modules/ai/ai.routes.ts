import { Router } from "express";
import { AiController } from "./ai.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { aiRateLimit } from "../../core/middleware/rate-limit.middleware";
import {
  matchLeadPropertiesSchema,
  generatePropertyDescriptionSchema,
  generateOutreachEmailSchema,
} from "./ai.validation";

const aiRouter = Router();

aiRouter.use(requireAuth);
aiRouter.use(aiRateLimit);

aiRouter.post(
  "/match-lead-properties",
  StrictRole("agent", "manager", "admin"),
  validate(matchLeadPropertiesSchema),
  AiController.matchLeadProperties,
);

aiRouter.post(
  "/generate-property-description",
  StrictRole("agent", "manager", "admin"),
  validate(generatePropertyDescriptionSchema),
  AiController.generatePropertyDescription,
);

aiRouter.post(
  "/generate-outreach-email",
  StrictRole("agent", "manager", "admin"),
  validate(generateOutreachEmailSchema),
  AiController.generateOutreachEmail,
);

export { aiRouter };
