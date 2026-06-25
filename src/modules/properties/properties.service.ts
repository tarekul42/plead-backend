import { propertiesRepository } from "./properties.repository";
import { PropertyModel, IProperty } from "./properties.model";

interface ListQuery {
  q?: string;
  location?: string;
  propertyType?: string;
  priceMin?: number;
  priceMax?: number;
  beds?: number;
  status?: string;
  sort?: string;
  page: number;
  limit: number;
}

export const PropertiesService = {
  async list(query: ListQuery, agencyId: string) {
    return propertiesRepository.list({ ...query, agencyId });
  },

  async getBySlug(slug: string, agencyId: string) {
    return propertiesRepository.findBySlug(slug, agencyId);
  },

  async getBySlugPublic(slug: string, agencyId: string) {
    const filter: Record<string, unknown> = { slug, status: "available" };
    if (agencyId) filter.agencyId = agencyId;
    return PropertyModel.findOne(filter);
  },

  async create(data: Partial<IProperty>) {
    let slug = data.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "property";
    let counter = 0;
    while (await PropertyModel.findOne({ slug, agencyId: data.agencyId })) {
      counter++;
      slug = `${slug}-${counter}`;
    }
    return propertiesRepository.create({ ...data, slug, publishedAt: new Date() });
  },

  async update(id: string, agencyId: string, data: Partial<IProperty>) {
    const existing = await propertiesRepository.findById(id, agencyId);
    if (!existing) return null;
    return propertiesRepository.update(id, agencyId, data);
  },

  async delete(id: string, agencyId: string) {
    return propertiesRepository.delete(id, agencyId);
  },

  async getRelated(id: string, agencyId: string) {
    return propertiesRepository.findRelated(id, agencyId);
  },
};
