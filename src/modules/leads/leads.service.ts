import { LeadsRepository } from "./leads.repository";
import { ILead } from "./leads.model";

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
};
