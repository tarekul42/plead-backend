import { InteractionsRepository } from "./interactions.repository";
import { IInteraction } from "./interactions.model";
import { LeadModel } from "../leads/leads.model";
import { NotFoundError } from "../../core/utils/app-error";

export const InteractionsService = {
  async listByAgency(agencyId: string, page = 1, limit = 50) {
    return InteractionsRepository.listByAgency(agencyId, page, limit);
  },

  async listByUser(userId: string, agencyId: string, page = 1, limit = 50) {
    return InteractionsRepository.listByUser(userId, agencyId, page, limit);
  },

  async listByLead(leadId: string, agencyId: string, page = 1, limit = 50) {
    return InteractionsRepository.listByLead(leadId, agencyId, page, limit);
  },

  async create(data: Partial<IInteraction>) {
    const leadExists = await LeadModel.exists({ _id: data.leadId, agencyId: data.agencyId });
    if (!leadExists) throw NotFoundError("Lead");
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
