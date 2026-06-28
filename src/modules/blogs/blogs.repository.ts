import { BlogModel, IBlog } from "./blogs.model";
import { QueryBuilder } from "../../core/utils/query-builder";
import { UserModel } from "../users/users.model";

async function populateBlog(blog: IBlog | null): Promise<IBlog | null> {
  if (!blog) return blog;
  const author = blog.authorId
    ? await UserModel.findById(blog.authorId).select("name avatarUrl").lean()
    : null;
  return { ...blog, author: author || null } as unknown as IBlog;
}

async function populateBlogList(blogs: IBlog[]): Promise<IBlog[]> {
  const authorIds = [...new Set(blogs.map((b) => b.authorId?.toString()).filter(Boolean))];
  const authors = await UserModel.find({ _id: { $in: authorIds } })
    .select("name avatarUrl")
    .lean();
  const authorMap: Record<string, unknown> = {};
  for (const a of authors) authorMap[a._id.toString()] = a;
  return blogs.map((b) => ({
    ...b,
    author: authorMap[b.authorId?.toString()] || null,
  })) as unknown as IBlog[];
}

export const BlogsRepository = {
  async list(agencyId: string, status?: string, page = 1, limit = 10) {
    const { data, total } = await new QueryBuilder(BlogModel)
      .where("agencyId", agencyId)
      .where("status", status)
      .sortDesc("publishedAt")
      .paginate(page, limit, 100, 10)
      .exec();
    const enriched = await populateBlogList(data);
    return { data: enriched, total };
  },

  async findBySlug(slug: string, agencyId: string): Promise<IBlog | null> {
    const blog = await BlogModel.findOne({ slug, agencyId }).lean();
    return populateBlog(blog);
  },

  async findById(id: string, agencyId: string): Promise<IBlog | null> {
    const blog = await BlogModel.findOne({ _id: id, agencyId }).lean();
    return populateBlog(blog);
  },

  create(data: Partial<IBlog>): Promise<IBlog> {
    return BlogModel.create(data);
  },

  async update(id: string, agencyId: string, data: Partial<IBlog>): Promise<IBlog | null> {
    return BlogModel.findOneAndUpdate({ _id: id, agencyId }, data, { new: true });
  },

  async delete(id: string, agencyId: string): Promise<boolean> {
    const result = await BlogModel.deleteOne({ _id: id, agencyId });
    return result.deletedCount > 0;
  },
};
