import { Router } from "express";
import { InteractionsController } from "./interactions.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createInteractionSchema, updateInteractionSchema } from "./interactions.validation";

const interactionsRouter = Router();

interactionsRouter.use(requireAuth);

interactionsRouter.get("/leads/:leadId/interactions", InteractionsController.listByLead);
interactionsRouter.post("/leads/:leadId/interactions", StrictRole("agent", "manager", "admin"), validate(createInteractionSchema), InteractionsController.create);
interactionsRouter.patch("/interactions/:id", StrictRole("agent", "manager", "admin"), validate(updateInteractionSchema), InteractionsController.update);
interactionsRouter.delete("/interactions/:id", StrictRole("manager", "admin"), InteractionsController.delete);

export { interactionsRouter };
