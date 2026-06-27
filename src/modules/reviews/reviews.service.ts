import { ReviewsRepository } from "./reviews.repository";
import { IReview } from "./reviews.model";
import { PropertyModel } from "../properties/properties.model";
import { ValidationError } from "../../core/utils/app-error";

export const ReviewsService = {
  async listByAgency(agencyId: string, isVerified?: string, page = 1, limit = 50) {
    return ReviewsRepository.listByAgency(agencyId, isVerified, page, limit);
  },

  async listByProperty(propertyId: string, agencyId: string, page = 1, limit = 50) {
    return ReviewsRepository.listByProperty(propertyId, agencyId, page, limit);
  },

  async create(data: Partial<IReview>) {
    const propertyExists = await PropertyModel.exists({ _id: data.propertyId, agencyId: data.agencyId });
    if (!propertyExists) {
      throw ValidationError([{ message: "Property not found in your agency", path: ["propertyId"] }]);
    }
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
