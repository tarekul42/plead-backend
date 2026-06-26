import { AgenciesRepository } from "./agencies.repository";
import { IAgency } from "./agencies.model";

export const AgenciesService = {
  async list() {
    return AgenciesRepository.findAll();
  },

  async getById(id: string) {
    return AgenciesRepository.findById(id);
  },

  async create(data: Partial<IAgency>) {
    let slug = data.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "agency";
    let counter = 0;
    while (await AgenciesRepository.findBySlug(slug)) {
      counter++;
      slug = `${slug}-${counter}`;
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
