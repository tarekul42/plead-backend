import { Router } from "express";
import { BlogsController } from "./blogs.controller";
import { requireAuth } from "../../core/middleware/auth.middleware";
import { StrictRole } from "../../core/middleware/rbac.middleware";
import { validate } from "../../core/middleware/validate.middleware";
import { createBlogSchema, updateBlogSchema, listBlogsQuerySchema, blogIdParamSchema, blogSlugParamSchema } from "./blogs.validation";

const blogsRouter = Router();

blogsRouter.get("/", validate(listBlogsQuerySchema, "query"), BlogsController.list);
blogsRouter.get("/id/:id", requireAuth, validate(blogIdParamSchema, "params"), BlogsController.getById);
blogsRouter.get("/:slug", validate(blogSlugParamSchema, "params"), BlogsController.getBySlug);
blogsRouter.post("/", requireAuth, StrictRole("manager", "admin"), validate(createBlogSchema), BlogsController.create);
blogsRouter.patch("/:id", requireAuth, StrictRole("manager", "admin"), validate(updateBlogSchema), validate(blogIdParamSchema, "params"), BlogsController.update);
blogsRouter.delete("/:id", requireAuth, StrictRole("manager", "admin"), validate(blogIdParamSchema, "params"), BlogsController.delete);

export { blogsRouter };
