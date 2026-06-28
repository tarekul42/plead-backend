import mongoose from "mongoose";
import { LeadsRepository } from "./leads.repository";
import { LeadModel, ILead } from "./leads.model";

export const LeadsService = {
  async list(query: { status?: string; assignedAgentId?: string; q?: string; page: number; limit: number }, agencyId: string) {
    return LeadsRepository.list({ ...query, agencyId });
  },

  async getById(id: string, agencyId: string) {
    return LeadsRepository.findById(id, agencyId);
  },

  async create(data: Partial<ILead>) {
    return LeadsRepository.create(data);
  },

  async update(id: string, agencyId: string, data: Partial<ILead>) {
    const existing = await LeadsRepository.findById(id, agencyId);
    if (!existing) return null;
    return LeadsRepository.update(id, agencyId, data);
  },

  async delete(id: string, agencyId: string) {
    return LeadsRepository.delete(id, agencyId);
  },

  async getStats(filter: { agencyId: string; assignedAgentId?: string }) {
    const agencyOid = new mongoose.Types.ObjectId(filter.agencyId);
    const agentOid = filter.assignedAgentId ? new mongoose.Types.ObjectId(filter.assignedAgentId) : undefined;

    const leadsFilter: Record<string, unknown> = { agencyId: filter.agencyId };
    if (agentOid) leadsFilter.assignedAgentId = agentOid;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, byStatus, last7Days, conversionResult, weeklyTrend] = await Promise.all([
      LeadModel.countDocuments(leadsFilter),
      LeadModel.aggregate([
        { $match: { agencyId: agencyOid, ...(agentOid ? { assignedAgentId: agentOid } : {}) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      LeadModel.countDocuments({ ...leadsFilter, createdAt: { $gte: sevenDaysAgo } }),
      LeadModel.aggregate([
        { $match: { agencyId: agencyOid, ...(agentOid ? { assignedAgentId: agentOid } : {}) } },
        {
          $facet: {
            total: [{ $count: "count" }],
            won: [{ $match: { status: "closed" } }, { $count: "count" }],
          },
        },
      ]),
      LeadModel.aggregate([
        { $match: { agencyId: agencyOid, ...(agentOid ? { assignedAgentId: agentOid } : {}), createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", count: 1 } },
      ]),
    ]);

    const byStatusMap: Record<string, number> = {};
    for (const s of byStatus) {
      byStatusMap[s._id] = s.count;
    }

    const totalCount = conversionResult[0]?.total?.[0]?.count || 0;
    const wonCount = conversionResult[0]?.won?.[0]?.count || 0;
    const conversionRate = totalCount > 0 ? Math.round((wonCount / totalCount) * 10000) / 100 : 0;

    return { total, byStatus: byStatusMap, last7Days, conversionRate, weeklyTrend };
  },
};
