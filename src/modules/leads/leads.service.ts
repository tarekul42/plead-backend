import { LeadsRepository } from "./leads.repository";
import { ILead } from "./leads.model";

export const LeadsService = {
  async list(query: Record<string, unknown>, agencyId: string) {
    return LeadsRepository.list({
      agencyId,
      status: query.status as string | undefined,
      assignedAgentId: query.assignedAgentId as string | undefined,
      q: query.q as string | undefined,
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
    const deleted = await LeadsRepository.delete(id, agencyId);
    if (deleted) {
      await LeadsRepository.deleteInteractions(id);
    }
    return deleted;
  },
};
