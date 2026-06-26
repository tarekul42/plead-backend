import { InteractionsRepository } from "./interactions.repository";
import { IInteraction } from "./interactions.model";

export const InteractionsService = {
  async listByAgency(agencyId: string) {
    return InteractionsRepository.listByAgency(agencyId);
  },

  async listByLead(leadId: string, agencyId: string) {
    return InteractionsRepository.listByLead(leadId, agencyId);
  },

  async create(data: Partial<IInteraction>) {
    return InteractionsRepository.create(data);
  },

  async update(id: string, agencyId: string, data: Partial<IInteraction>) {
    const existing = await InteractionsRepository.findById(id, agencyId);
    if (!existing) return null;
    return InteractionsRepository.update(id, agencyId, data);
  },

  async delete(id: string, agencyId: string) {
    return InteractionsRepository.delete(id, agencyId);
  },
};
