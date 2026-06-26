import { UserModel } from "../users/users.model";
import { PropertyModel } from "../properties/properties.model";
import { LeadModel } from "../leads/leads.model";
import { ReviewModel } from "../reviews/reviews.model";
import { AiAnalysisModel } from "../ai/models/ai-analysis.model";
import { QueryBuilder } from "../../core/utils/query-builder";

export const AdminService = {
  async getAgencyStats(agencyId: string) {
    const [totalUsers, totalProperties, totalLeads, activeLeads, totalReviews, aiCalls] = await Promise.all([
      UserModel.countDocuments({ agencyId }),
      PropertyModel.countDocuments({ agencyId }),
      LeadModel.countDocuments({ agencyId }),
      LeadModel.countDocuments({ agencyId, status: { $in: ["new", "contacted", "qualified"] } }),
      ReviewModel.countDocuments({ agencyId }),
      AiAnalysisModel.countDocuments({ agencyId }),
    ]);

    return {
      totalUsers,
      totalProperties,
      totalLeads,
      activeLeads,
      totalReviews,
      aiCalls,
    };
  },

  async listUsers(agencyId: string, page = 1, limit = 50) {
    return new QueryBuilder(UserModel)
      .where("agencyId", agencyId)
      .sortDesc("createdAt")
      .paginate(page, limit, 100, 50)
      .exec();
  },

  async toggleUserStatus(userId: string, agencyId: string) {
    const user = await UserModel.findOne({ _id: userId, agencyId });
    if (!user) return null;
    user.isActive = !user.isActive;
    return user.save();
  },

  async getRecentAiAnalytics(agencyId: string, limit = 20) {
    return AiAnalysisModel.find({ agencyId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },
};
