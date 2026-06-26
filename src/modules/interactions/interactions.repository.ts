import { InteractionModel, IInteraction } from "./interactions.model";
import { QueryBuilder } from "../../core/utils/query-builder";

export const InteractionsRepository = {
  async listByAgency(agencyId: string, page = 1, limit = 50) {
    return new QueryBuilder(InteractionModel)
      .where("agencyId", agencyId)
      .sortDesc("createdAt")
      .paginate(page, limit, 100, 50)
      .exec();
  },

  async listByLead(leadId: string, agencyId: string, page = 1, limit = 50) {
    return new QueryBuilder(InteractionModel)
      .where("leadId", leadId)
      .where("agencyId", agencyId)
      .sortDesc("createdAt")
      .paginate(page, limit, 100, 50)
      .exec();
  },

  async findById(id: string, agencyId: string): Promise<IInteraction | null> {
    return InteractionModel.findOne({ _id: id, agencyId });
  },

  async create(data: Partial<IInteraction>): Promise<IInteraction> {
    return InteractionModel.create(data);
  },

  async update(id: string, agencyId: string, data: Partial<IInteraction>): Promise<IInteraction | null> {
    return InteractionModel.findOneAndUpdate({ _id: id, agencyId }, data, { new: true });
  },

  async delete(id: string, agencyId: string): Promise<boolean> {
    const result = await InteractionModel.deleteOne({ _id: id, agencyId });
    return result.deletedCount > 0;
  },
};
