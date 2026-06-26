import { ReviewsRepository } from "./reviews.repository";
import { IReview } from "./reviews.model";

export const ReviewsService = {
  async listByAgency(agencyId: string, filter?: Record<string, unknown>) {
    return ReviewsRepository.listByAgency(agencyId, filter);
  },

  async listByProperty(propertyId: string, agencyId: string) {
    return ReviewsRepository.listByProperty(propertyId, agencyId);
  },

  async create(data: Partial<IReview>) {
    return ReviewsRepository.create(data);
  },

  async update(id: string, agencyId: string, data: Partial<IReview>) {
    const existing = await ReviewsRepository.findById(id, agencyId);
    if (!existing) return null;
    return ReviewsRepository.update(id, agencyId, data);
  },

  async delete(id: string, agencyId: string) {
    return ReviewsRepository.delete(id, agencyId);
  },
};
