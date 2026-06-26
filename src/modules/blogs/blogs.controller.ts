import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { Pagination } from "../../core/utils/pagination";
import { BlogsService } from "./blogs.service";

export const BlogsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 10);
    const { data, total } = await BlogsService.list(
      req.user!.agencyId,
      req.query.status as string | undefined,
      page,
      limit,
    );
    res.json(success(data, Pagination.meta(page, limit, total)));
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const blog = await BlogsService.getBySlug(String(req.params.slug), req.user!.agencyId);
    if (!blog) throw NotFoundError("Blog");
    res.json(success(blog));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const blog = await BlogsService.getById(String(req.params.id), req.user!.agencyId);
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
