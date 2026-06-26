import { BlogModel, IBlog } from "./blogs.model";
import { QueryBuilder } from "../../core/utils/query-builder";

export const BlogsRepository = {
  async list(agencyId: string, status?: string, page = 1, limit = 10) {
    return new QueryBuilder(BlogModel)
      .where("agencyId", agencyId)
      .where("status", status)
      .sortDesc("publishedAt")
      .paginate(page, limit, 100, 10)
      .exec();
  },

  findBySlug(slug: string, agencyId: string): Promise<IBlog | null> {
    return BlogModel.findOne({ slug, agencyId }).lean();
  },

  findById(id: string, agencyId: string): Promise<IBlog | null> {
    return BlogModel.findOne({ _id: id, agencyId }).lean();
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
