import { ReviewModel, IReview } from "./reviews.model";
import { QueryBuilder } from "../../core/utils/query-builder";

export const ReviewsRepository = {
  async listByAgency(agencyId: string, isVerified?: string, page = 1, limit = 50) {
    return new QueryBuilder(ReviewModel)
      .where("agencyId", agencyId)
      .whereBoolean("isVerified", isVerified)
      .sortDesc("createdAt")
      .paginate(page, limit, 100, 50)
      .exec();
  },

  async listByProperty(propertyId: string, agencyId: string, page = 1, limit = 50) {
    return new QueryBuilder(ReviewModel)
      .where("propertyId", propertyId)
      .where("agencyId", agencyId)
      .sortDesc("createdAt")
      .paginate(page, limit, 100, 50)
      .exec();
  },

  async findById(id: string, agencyId: string): Promise<IReview | null> {
    return ReviewModel.findOne({ _id: id, agencyId }).lean();
  },

  async create(data: Partial<IReview>): Promise<IReview> {
    return ReviewModel.create(data);
  },

  async update(id: string, agencyId: string, data: Partial<IReview>): Promise<IReview | null> {
    return ReviewModel.findOneAndUpdate({ _id: id, agencyId }, data, { new: true });
  },

  async delete(id: string, agencyId: string): Promise<boolean> {
    const result = await ReviewModel.deleteOne({ _id: id, agencyId });
    return result.deletedCount > 0;
  },
};
