import { PropertiesRepository } from "./properties.repository";
import { PropertyModel, IProperty } from "./properties.model";
import { ReviewModel } from "../reviews/reviews.model";
import { UserModel } from "../users/users.model";
import { AiGeneratedCopyModel } from "../ai/models/ai-copy.model";
import { InternalError, ValidationError } from "../../core/utils/app-error";

export interface ListQuery {
  q?: string;
  location?: string;
  propertyType?: string;
  priceMin?: number;
  priceMax?: number;
  beds?: number;
  status?: string;
  sort?: string;
  page: number;
  limit: number;
}

export const PropertiesService = {
  async list(query: ListQuery, agencyId: string) {
    return PropertiesRepository.list({ ...query, agencyId });
  },

  async getById(id: string, agencyId: string) {
    return PropertiesRepository.findById(id, agencyId);
  },

  async getBySlug(slug: string, agencyId: string) {
    return PropertiesRepository.findBySlug(slug, agencyId);
  },

  async create(data: Partial<IProperty>) {
    const agentExists = await UserModel.exists({ _id: data.assignedAgentId, agencyId: data.agencyId });
    if (!agentExists) {
      throw ValidationError([{ message: "Assigned agent not found in your agency", path: ["assignedAgentId"] }]);
    }

    const base = data.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "property";
    let slug = base;
    while (await PropertyModel.findOne({ slug, agencyId: data.agencyId }).lean()) {
      slug = `${base}-${Date.now()}`;
    }
    return PropertiesRepository.create({ ...data, slug, publishedAt: new Date() });
  },

  async update(id: string, agencyId: string, data: Partial<IProperty>) {
    const existing = await PropertiesRepository.findById(id, agencyId);
    if (!existing) return null;

    if (data.assignedAgentId) {
      const agentExists = await UserModel.exists({ _id: data.assignedAgentId, agencyId });
      if (!agentExists) {
        throw ValidationError([{ message: "Assigned agent not found in your agency", path: ["assignedAgentId"] }]);
      }
    }

    return PropertiesRepository.update(id, agencyId, data);
  },

  async delete(id: string, agencyId: string) {
    const session = await PropertyModel.startSession();
    try {
      session.startTransaction();
      const result = await PropertyModel.deleteOne({ _id: id, agencyId }).session(session);
      if (result.deletedCount === 0) {
        await session.abortTransaction();
        return false;
      }
      await ReviewModel.deleteMany({ propertyId: id, agencyId }).session(session);
      await AiGeneratedCopyModel.deleteMany({ propertyId: id, agencyId }).session(session);
      await session.commitTransaction();
      return true;
    } catch {
      await session.abortTransaction();
      throw InternalError("Failed to delete property and associated data");
    } finally {
      session.endSession();
    }
  },

  async getRelated(id: string, agencyId: string) {
    return PropertiesRepository.findRelated(id, agencyId);
  },
};
