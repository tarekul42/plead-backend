import { AgenciesRepository } from "./agencies.repository";
import { IAgency } from "./agencies.model";

export const AgenciesService = {
  async getById(id: string) {
    return AgenciesRepository.findById(id);
  },

  async create(data: Partial<IAgency>) {
    const slug = data.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    return AgenciesRepository.create({ ...data, slug });
  },

  async update(id: string, data: Partial<IAgency>) {
    return AgenciesRepository.update(id, data);
  },
};
