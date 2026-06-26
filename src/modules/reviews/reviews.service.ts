import { ReviewsRepository } from "./reviews.repository";
import { IReview } from "./reviews.model";

export const ReviewsService = {
  async listByAgency(agencyId: string, isVerified?: string, page = 1, limit = 50) {
    return ReviewsRepository.listByAgency(agencyId, isVerified, page, limit);
  },

  async listByProperty(propertyId: string, agencyId: string, page = 1, limit = 50) {
    return ReviewsRepository.listByProperty(propertyId, agencyId, page, limit);
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
