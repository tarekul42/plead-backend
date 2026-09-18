import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { NotFoundError } from "../../core/utils/app-error";
import { Pagination } from "../../core/utils/pagination";
import { BlogModel } from "./blogs.model";

export const BlogsPublicController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = Pagination.from(req.query, 10);
    const filter = { status: "published" as const };

    const [data, total] = await Promise.all([
      BlogModel.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("authorId", "name avatarUrl")
        .lean(),
      BlogModel.countDocuments(filter),
    ]);

    res.json(success(data, Pagination.meta(page, limit, total)));
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const blog = await BlogModel.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate("authorId", "name avatarUrl")
      .lean();

    if (!blog) throw NotFoundError("Blog");
    res.json(success(blog));
  }),
};
