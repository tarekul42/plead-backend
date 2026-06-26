import { AgencyModel, IAgency } from "./agencies.model";
import { UserModel } from "../users/users.model";
import { PropertyModel } from "../properties/properties.model";
import { LeadModel } from "../leads/leads.model";
import { InteractionModel } from "../interactions/interactions.model";
import { ReviewModel } from "../reviews/reviews.model";
import { AiAnalysisModel } from "../ai/models/ai-analysis.model";
import { BlogModel } from "../blogs/blogs.model";
import { QueryBuilder } from "../../core/utils/query-builder";
import { logger } from "../../core/utils/logger";
import { getErrorMessage } from "../../core/utils/safe-error";
import { InternalError } from "../../core/utils/app-error";

export const AgenciesRepository = {
  async findAll(page = 1, limit = 20): Promise<{ data: IAgency[]; total: number }> {
    return new QueryBuilder(AgencyModel)
      .sortAsc("name")
      .paginate(page, limit, 100, 20)
      .exec();
  },

  findById(id: string): Promise<IAgency | null> {
    return AgencyModel.findById(id).lean();
  },

  findBySlug(slug: string): Promise<IAgency | null> {
    return AgencyModel.findOne({ slug }).lean();
  },

  create(data: Partial<IAgency>): Promise<IAgency> {
    return AgencyModel.create(data);
  },

  async update(id: string, data: Partial<IAgency>): Promise<IAgency | null> {
    return AgencyModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string): Promise<boolean> {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      } catch (error) {
        await session.abortTransaction();
        const isTransient = typeof error === "object" && error !== null && "errorLabels" in error
          && Array.isArray((error as { errorLabels: string[] }).errorLabels)
          && (error as { errorLabels: string[] }).errorLabels.includes("TransientTransactionError");
        if (isTransient && attempt < maxRetries) {
          logger.warn({ attempt, id, error: getErrorMessage(error) }, "Transaction failed, retrying");
          continue;
        }
        throw InternalError(`Failed to delete agency: ${getErrorMessage(error)}`);
      } finally {
        session.endSession();
      }
    }
    return false;
  },
};
