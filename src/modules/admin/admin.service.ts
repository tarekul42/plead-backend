import { UserModel } from "../users/users.model";
import { PropertyModel } from "../properties/properties.model";
import { LeadModel } from "../leads/leads.model";
import { ReviewModel } from "../reviews/reviews.model";
import { AiAnalysisModel } from "../ai/models/ai-analysis.model";

export const AdminService = {
  async getPlatformStats() {
    const [totalUsers, totalProperties, totalLeads, totalReviews, totalAiCalls] = await Promise.all([
      UserModel.countDocuments(),
      PropertyModel.countDocuments(),
      LeadModel.countDocuments(),
      ReviewModel.countDocuments(),
      AiAnalysisModel.countDocuments(),
    ]);

    return {
      totalUsers,
      totalProperties,
      totalLeads,
      totalReviews,
      totalAiCalls,
    };
  },

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

  async listUsers() {
    return UserModel.find().sort({ createdAt: -1 }).lean();
  },

  async toggleUserStatus(userId: string) {
    const user = await UserModel.findById(userId);
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
