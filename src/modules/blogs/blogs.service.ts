import { BlogsRepository } from "./blogs.repository";
import { IBlog } from "./blogs.model";

export const BlogsService = {
  async list(agencyId: string, status?: string, page = 1, limit = 10) {
    return BlogsRepository.list(agencyId, status, page, limit);
  },

  async getById(id: string, agencyId: string) {
    return BlogsRepository.findById(id, agencyId);
  },

  async getBySlug(slug: string, agencyId: string) {
    return BlogsRepository.findBySlug(slug, agencyId);
  },

  async create(data: Partial<IBlog>) {
    const agencyId = data.agencyId ? String(data.agencyId) : "";
    const base = data.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "post";
    let slug = base;
    while (agencyId && await BlogsRepository.findBySlug(slug, agencyId)) {
      slug = `${base}-${Date.now()}`;
    }
    return BlogsRepository.create({ ...data, slug, publishedAt: data.status === "published" ? new Date() : undefined });
  },

  async update(id: string, agencyId: string, data: Partial<IBlog>) {
    const existing = await BlogsRepository.findById(id, agencyId);
    if (!existing) return null;
    const updateData = { ...data };
    if (data.status === "published" && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
    return BlogsRepository.update(id, agencyId, updateData);
  },

  async delete(id: string, agencyId: string) {
    return BlogsRepository.delete(id, agencyId);
  },
};
