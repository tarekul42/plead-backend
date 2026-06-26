import { Router } from "express";
import { usersController } from "./users.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { objectId } from "../../core/utils/validation";
import { z } from "zod";

const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/me", usersController.getMe);
usersRouter.get("/", usersController.list);
usersRouter.get("/:id", validate(z.object({ id: objectId }), "params"), usersController.getById);
usersRouter.patch("/:id", StrictRole("manager", "admin"), validate(z.object({ id: objectId }), "params"), usersController.update);
usersRouter.delete("/:id", StrictRole("admin"), validate(z.object({ id: objectId }), "params"), usersController.delete);

export { usersRouter };
