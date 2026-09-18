import { Router } from "express";
import { BlogsPublicController } from "./blogs.public.controller";
import { validate } from "../../core/middleware/validate.middleware";
import { blogSlugParamSchema, listBlogsQuerySchema } from "./blogs.validation";

const blogsPublicRouter = Router();

blogsPublicRouter.get(
  "/",
  validate(listBlogsQuerySchema, "query"),
  BlogsPublicController.list,
);

blogsPublicRouter.get(
  "/:slug",
  validate(blogSlugParamSchema, "params"),
  BlogsPublicController.getBySlug,
);

export { blogsPublicRouter };
