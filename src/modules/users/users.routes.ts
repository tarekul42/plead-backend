import { Router } from "express";
import { UsersController } from "./users.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { objectId } from "../../core/utils/validation";
import { z } from "zod";
import { updateUserSchema } from "./users.validation";

const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/me", UsersController.getMe);
usersRouter.get("/", UsersController.list);
usersRouter.get("/:id", validate(z.object({ id: objectId }), "params"), UsersController.getById);
usersRouter.patch("/:id", StrictRole("manager", "admin"), validate(updateUserSchema), validate(z.object({ id: objectId }), "params"), UsersController.update);
usersRouter.delete("/:id", StrictRole("admin"), validate(z.object({ id: objectId }), "params"), UsersController.delete);

export { usersRouter };
