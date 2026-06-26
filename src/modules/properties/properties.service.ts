import { propertiesRepository } from "./properties.repository";
import { PropertyModel, IProperty } from "./properties.model";
import { ReviewModel } from "../reviews/reviews.model";

export interface ListQuery {
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

  async getById(id: string, agencyId: string) {
    return propertiesRepository.findById(id, agencyId);
  },

  async getBySlug(slug: string, agencyId: string) {
    return propertiesRepository.findBySlug(slug, agencyId);
  },

  async getBySlugPublic(slug: string) {
    return PropertyModel.findOne({ slug, status: "available" });
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
    const deleted = await propertiesRepository.delete(id, agencyId);
    if (deleted) {
      await ReviewModel.deleteMany({ propertyId: id, agencyId });
    }
    return deleted;
  },

  async getRelated(id: string, agencyId: string) {
    return propertiesRepository.findRelated(id, agencyId);
  },
};
