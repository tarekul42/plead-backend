import { AgencyModel, IAgency } from "./agencies.model";
import { UserModel } from "../users/users.model";
import { PropertyModel } from "../properties/properties.model";
import { LeadModel } from "../leads/leads.model";
import { InteractionModel } from "../interactions/interactions.model";
import { ReviewModel } from "../reviews/reviews.model";
import { AiAnalysisModel } from "../ai/models/ai-analysis.model";
import { BlogModel } from "../blogs/blogs.model";

export const AgenciesRepository = {
  async findAll(): Promise<IAgency[]> {
    return AgencyModel.find().sort({ name: 1 }).lean();
  },

  async findById(id: string): Promise<IAgency | null> {
    return AgencyModel.findById(id);
  },

  async findBySlug(slug: string): Promise<IAgency | null> {
    return AgencyModel.findOne({ slug });
  },

  async create(data: Partial<IAgency>): Promise<IAgency> {
    return AgencyModel.create(data);
  },

  async update(id: string, data: Partial<IAgency>): Promise<IAgency | null> {
    return AgencyModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string): Promise<boolean> {
    const session = await AgencyModel.startSession();
    try {
      session.startTransaction();
      await Promise.all([
        UserModel.deleteMany({ agencyId: id }).session(session),
        PropertyModel.deleteMany({ agencyId: id }).session(session),
        LeadModel.deleteMany({ agencyId: id }).session(session),
        InteractionModel.deleteMany({ agencyId: id }).session(session),
        ReviewModel.deleteMany({ agencyId: id }).session(session),
        BlogModel.deleteMany({ agencyId: id }).session(session),
        AiAnalysisModel.deleteMany({ agencyId: id }).session(session),
      ]);
      const result = await AgencyModel.deleteOne({ _id: id }).session(session);
      await session.commitTransaction();
      return result.deletedCount > 0;
    } catch {
      await session.abortTransaction();
      throw new Error("Failed to delete agency and associated data");
    } finally {
      session.endSession();
    }
  },
};
