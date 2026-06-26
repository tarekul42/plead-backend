import { LeadModel, ILead } from "./leads.model";
import { InteractionModel } from "../interactions/interactions.model";
import { QueryBuilder } from "../../core/utils/query-builder";
import { InternalError } from "../../core/utils/app-error";

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
    const builder = new QueryBuilder(LeadModel)
      .where("agencyId", params.agencyId)
      .where("status", params.status)
      .where("assignedAgentId", params.assignedAgentId)
      .search(["name", "email"], params.q)
      .sortDesc("createdAt")
      .paginate(params.page, params.limit, 100, 20);

    return builder.exec();
  },

  async findById(id: string, agencyId: string): Promise<ILead | null> {
    return LeadModel.findOne({ _id: id, agencyId }).lean();
  },

  async create(data: Partial<ILead>): Promise<ILead> {
    return LeadModel.create(data);
  },

  async update(id: string, agencyId: string, data: Partial<ILead>): Promise<ILead | null> {
    return LeadModel.findOneAndUpdate({ _id: id, agencyId }, data, { new: true });
  },

  async delete(id: string, agencyId: string): Promise<boolean> {
    const session = await LeadModel.startSession();
    try {
      session.startTransaction();
      const result = await LeadModel.deleteOne({ _id: id, agencyId }).session(session);
      if (result.deletedCount === 0) {
        await session.abortTransaction();
        return false;
      }
      await InteractionModel.deleteMany({ leadId: id }).session(session);
      await session.commitTransaction();
      return true;
    } catch {
      await session.abortTransaction();
      throw InternalError("Failed to delete lead and associated data");
    } finally {
      session.endSession();
    }
  },
};
