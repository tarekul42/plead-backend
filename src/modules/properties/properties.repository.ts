import { PropertyModel, IProperty } from "./properties.model";
import { UserModel } from "../users/users.model";
import { QueryBuilder } from "../../core/utils/query-builder";

interface ListParams {
  agencyId: string;
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

async function populateAgent(property: IProperty | null): Promise<IProperty | null> {
  if (!property) return property;
  if (property.assignedAgentId) {
    const agent = await UserModel.findById(property.assignedAgentId).select("name email avatarUrl").lean();
    return { ...property, assignedAgent: agent || null } as unknown as IProperty;
  }
  return property;
}

async function populateAgentList(properties: IProperty[]): Promise<IProperty[]> {
  const agentIds = [...new Set(properties.map(p => p.assignedAgentId?.toString()).filter(Boolean))];
  const agents = await UserModel.find({ _id: { $in: agentIds } }).select("name email avatarUrl").lean();
  const agentMap: Record<string, unknown> = {};
  for (const a of agents) agentMap[a._id.toString()] = a;
  return properties.map(p => ({ ...p, assignedAgent: agentMap[p.assignedAgentId?.toString()] || null }) as unknown as IProperty);
}

async function findById(id: string, agencyId: string): Promise<IProperty | null> {
  const query: Record<string, unknown> = { _id: id };
  if (agencyId) query.agencyId = agencyId;
  const property = await PropertyModel.findOne(query).lean();
  return populateAgent(property);
}

const sortMap: Record<string, string> = {
  newest: "publishedAt",
  oldest: "publishedAt",
  "price-asc": "price",
  "price-desc": "price",
  "-createdAt": "createdAt",
  "createdAt": "createdAt",
  "-views": "views",
  "views": "views",
};

export const PropertiesRepository = {
  async list(params: ListParams) {
    const builder = new QueryBuilder(PropertyModel)
      .where("agencyId", params.agencyId)
      .whereTextSearch(params.q)
      .whereRegex("location", params.location || "")
      .where("propertyType", params.propertyType)
      .where("status", params.status)
      .whereRange("beds", params.beds)
      .whereRange("price", params.priceMin, params.priceMax)
      .sortBy(sortMap, params.sort)
      .paginate(params.page, params.limit, 100, 12);

    const { data, total } = await builder.exec();
    const enriched = await populateAgentList(data);
    return { data: enriched, total };
  },

  async findBySlug(slug: string, agencyId: string): Promise<IProperty | null> {
    const query: Record<string, unknown> = { slug };
    if (agencyId) query.agencyId = agencyId;
    const property = await PropertyModel.findOne(query).lean();
    return populateAgent(property);
  },

  findById,

  create(data: Partial<IProperty>) {
    return PropertyModel.create(data);
  },

  update(id: string, agencyId: string, data: Partial<IProperty>) {
    const query: Record<string, unknown> = { _id: id };
    if (agencyId) query.agencyId = agencyId;
    return PropertyModel.findOneAndUpdate(query, data, { new: true });
  },

  async delete(id: string, agencyId: string) {
    const query: Record<string, unknown> = { _id: id };
    if (agencyId) query.agencyId = agencyId;
    const result = await PropertyModel.deleteOne(query);
    return result.deletedCount > 0;
  },

  async findRelated(propertyId: string, agencyId: string, limit = 4) {
    const property = await findById(propertyId, agencyId);
    if (!property) return [];

    const query: Record<string, unknown> = {
      _id: { $ne: propertyId },
      propertyType: property.propertyType,
      status: "available",
      price: {
        $gte: property.price * 0.7,
        $lte: property.price * 1.3,
      },
    };
    if (agencyId) query.agencyId = agencyId;

    const properties = await PropertyModel.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    return populateAgentList(properties);
  },
};
