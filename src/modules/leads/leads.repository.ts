import { LeadModel, ILead } from "./leads.model";

interface ListParams {
  agencyId: string;
  status?: string;
  assignedAgentId?: string;
  q?: string;
  page: number;
  limit: number;
}

export const LeadsRepository = {
  async list(params: ListParams) {
    const filter: Record<string, unknown> = { agencyId: params.agencyId };

    if (params.status) filter.status = params.status;
    if (params.assignedAgentId) filter.assignedAgentId = params.assignedAgentId;
    if (params.q) {
      filter.$or = [
        { name: { $regex: params.q, $options: "i" } },
        { email: { $regex: params.q, $options: "i" } },
      ];
    }

    const skip = (params.page - 1) * params.limit;
    const data = await LeadModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(params.limit).lean();
    const total = await LeadModel.countDocuments(filter);

    return { data, total };
  },

  async findById(id: string, agencyId: string): Promise<ILead | null> {
    return LeadModel.findOne({ _id: id, agencyId });
  },

  async create(data: Partial<ILead>): Promise<ILead> {
    return LeadModel.create(data);
  },

  async update(id: string, agencyId: string, data: Partial<ILead>): Promise<ILead | null> {
    return LeadModel.findOneAndUpdate({ _id: id, agencyId }, data, { new: true });
  },

  async delete(id: string, agencyId: string): Promise<boolean> {
    const result = await LeadModel.deleteOne({ _id: id, agencyId });
    return result.deletedCount > 0;
  },
};
