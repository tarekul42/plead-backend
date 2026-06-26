import { LeadsRepository } from "./leads.repository";
import { ILead } from "./leads.model";

export const LeadsService = {
  async list(query: Record<string, unknown>, agencyId: string) {
    return LeadsRepository.list({
      agencyId,
      status: typeof query.status === "string" ? query.status : undefined,
      assignedAgentId: typeof query.assignedAgentId === "string" ? query.assignedAgentId : undefined,
      q: typeof query.q === "string" ? query.q : undefined,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    });
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
};
