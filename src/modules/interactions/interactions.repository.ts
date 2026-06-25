import { InteractionModel, IInteraction } from "./interactions.model";

export const InteractionsRepository = {
  async listByLead(leadId: string, agencyId: string) {
    return InteractionModel.find({ leadId, agencyId }).sort({ createdAt: -1 }).lean();
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
