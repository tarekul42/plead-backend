import { Router } from "express";
import { usersController } from "./users.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";

const usersRouter = Router();

usersRouter.get("/me", requireAuth, usersController.getMe);
usersRouter.get("/", requireAuth, usersController.list);

export { usersRouter };
