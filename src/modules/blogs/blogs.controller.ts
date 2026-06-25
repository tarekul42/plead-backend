import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { BlogsService } from "./blogs.service";

export const BlogsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { data, total } = await BlogsService.list(
      req.user!.agencyId,
      req.query.status as string,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10,
    );
    res.json(success(data, { page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 10, total }));
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const blog = await BlogsService.getBySlug(String(req.params.slug), req.user!.agencyId);
    if (!blog) throw NotFoundError("Blog");
    res.json(success(blog));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const blog = await BlogsService.create({ ...req.body, agencyId: req.user!.agencyId, authorId: req.user!.id });
    res.status(201).json(success(blog));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const blog = await BlogsService.update(String(req.params.id), req.user!.agencyId, req.body);
    if (!blog) throw NotFoundError("Blog");
    res.json(success(blog));
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const deleted = await BlogsService.delete(String(req.params.id), req.user!.agencyId);
    if (!deleted) throw NotFoundError("Blog");
    res.json(success({ deleted: true }));
  }),
};
