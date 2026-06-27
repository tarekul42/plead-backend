import { InteractionsRepository } from "./interactions.repository";
import { IInteraction } from "./interactions.model";
import { LeadModel } from "../leads/leads.model";
import { NotFoundError } from "../../core/utils/app-error";

export const InteractionsService = {
  async listByAgency(agencyId: string, page = 1, limit = 50, type?: string, leadId?: string, startDate?: string, endDate?: string) {
    return InteractionsRepository.listByAgency(agencyId, page, limit, type, leadId, startDate, endDate);
  },

  async listByUser(userId: string, agencyId: string, page = 1, limit = 50, type?: string, startDate?: string, endDate?: string) {
    return InteractionsRepository.listByUser(userId, agencyId, page, limit, type, startDate, endDate);
  },

  async listByLead(leadId: string, agencyId: string, page = 1, limit = 50) {
    return InteractionsRepository.listByLead(leadId, agencyId, page, limit);
  },

  async create(data: Partial<IInteraction>) {
    const leadExists = await LeadModel.exists({ _id: data.leadId, agencyId: data.agencyId });
    if (!leadExists) throw NotFoundError("Lead");
    return InteractionsRepository.create(data);
  },

  async update(id: string, agencyId: string, userId: string, role: string, data: Partial<IInteraction>) {
    const existing = await InteractionsRepository.findById(id, agencyId);
    if (!existing) return null;
    if (role === "agent" && existing.performedById?.toString() !== userId) return null;
    return InteractionsRepository.update(id, agencyId, data);
  },

  async delete(id: string, agencyId: string, userId: string, role: string) {
    if (role !== "agent") return InteractionsRepository.delete(id, agencyId);
    const existing = await InteractionsRepository.findById(id, agencyId);
    if (!existing || existing.performedById?.toString() !== userId) return false;
    return InteractionsRepository.delete(id, agencyId);
  },
};
