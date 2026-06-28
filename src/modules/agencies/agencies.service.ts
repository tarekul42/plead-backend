import { AgenciesRepository } from "./agencies.repository";
import { IAgency } from "./agencies.model";
import { ForbiddenError } from "../../core/utils/app-error";

export const AgenciesService = {
  async list(agencyId: string, page = 1, limit = 20) {
    return AgenciesRepository.findAll(agencyId, page, limit);
  },

  async getById(id: string, agencyId: string) {
    if (id !== agencyId) throw ForbiddenError("You can only access your own agency");
    return AgenciesRepository.findById(agencyId);
  },

  async create(data: Partial<IAgency>) {
    const base =
      data.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") || "agency";
    let slug = base;
    while (await AgenciesRepository.findBySlug(slug)) {
      slug = `${base}-${Date.now()}`;
    }
    return AgenciesRepository.create({ ...data, slug });
  },

  async update(id: string, agencyId: string, data: Partial<IAgency>) {
    if (id !== agencyId) throw ForbiddenError("You can only modify your own agency");
    return AgenciesRepository.update(agencyId, data);
  },

  async delete(id: string, agencyId: string) {
    if (id !== agencyId) throw ForbiddenError("You can only delete your own agency");
    return AgenciesRepository.delete(agencyId);
  },
};
