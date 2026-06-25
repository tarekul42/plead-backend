import { Router } from "express";
import { BlogsController } from "./blogs.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createBlogSchema, updateBlogSchema } from "./blogs.validation";

const blogsRouter = Router();

blogsRouter.get("/", BlogsController.list);
blogsRouter.get("/:slug", BlogsController.getBySlug);
blogsRouter.post("/", requireAuth, StrictRole("manager", "admin"), validate(createBlogSchema), BlogsController.create);
blogsRouter.patch("/:id", requireAuth, StrictRole("manager", "admin"), validate(updateBlogSchema), BlogsController.update);
blogsRouter.delete("/:id", requireAuth, StrictRole("manager", "admin"), BlogsController.delete);

export { blogsRouter };
