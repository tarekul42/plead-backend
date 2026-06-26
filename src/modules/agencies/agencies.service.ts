import { AgenciesRepository } from "./agencies.repository";
import { IAgency } from "./agencies.model";

export const AgenciesService = {
  async list(page = 1, limit = 20) {
    return AgenciesRepository.findAll(page, limit);
  },

  async getById(id: string) {
    return AgenciesRepository.findById(id);
  },

  async create(data: Partial<IAgency>) {
    const base = data.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "agency";
    let slug = base;
    while (await AgenciesRepository.findBySlug(slug)) {
      slug = `${base}-${Date.now()}`;
    }
    return AgenciesRepository.create({ ...data, slug });
  },

  async update(id: string, data: Partial<IAgency>) {
    return AgenciesRepository.update(id, data);
  },

  async delete(id: string) {
    return AgenciesRepository.delete(id);
  },
};
