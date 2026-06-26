import { Router } from "express";
import { InteractionsController } from "./interactions.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createInteractionSchema, updateInteractionSchema, interactionLeadParamSchema, interactionIdParamSchema } from "./interactions.validation";

const interactionsRouter = Router();

interactionsRouter.use(requireAuth);

interactionsRouter.get("/interactions", requireAuth, InteractionsController.list);
interactionsRouter.get("/leads/:leadId/interactions", validate(interactionLeadParamSchema, "params"), InteractionsController.listByLead);
interactionsRouter.post("/leads/:leadId/interactions", StrictRole("agent", "manager", "admin"), validate(createInteractionSchema), validate(interactionLeadParamSchema, "params"), InteractionsController.create);
interactionsRouter.patch("/interactions/:id", StrictRole("agent", "manager", "admin"), validate(updateInteractionSchema), validate(interactionIdParamSchema, "params"), InteractionsController.update);
interactionsRouter.delete("/interactions/:id", StrictRole("manager", "admin"), validate(interactionIdParamSchema, "params"), InteractionsController.delete);

export { interactionsRouter };
