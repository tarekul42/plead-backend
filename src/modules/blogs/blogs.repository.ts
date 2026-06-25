import { BlogModel, IBlog } from "./blogs.model";

export const BlogsRepository = {
  async list(agencyId: string, status?: string, page = 1, limit = 10) {
    const filter: Record<string, unknown> = { agencyId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const data = await BlogModel.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean();
    const total = await BlogModel.countDocuments(filter);
    return { data, total };
  },

  async findBySlug(slug: string, agencyId: string): Promise<IBlog | null> {
    return BlogModel.findOne({ slug, agencyId });
  },

  async findById(id: string, agencyId: string): Promise<IBlog | null> {
    return BlogModel.findOne({ _id: id, agencyId });
  },

  async create(data: Partial<IBlog>): Promise<IBlog> {
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
