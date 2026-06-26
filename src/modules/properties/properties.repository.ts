import { PropertyModel, IProperty } from "./properties.model";
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

async function findById(id: string, agencyId: string): Promise<IProperty | null> {
  return PropertyModel.findOne({ _id: id, agencyId }).lean();
}

const sortMap: Record<string, string> = {
  newest: "publishedAt",
  oldest: "publishedAt",
  "price-asc": "price",
  "price-desc": "price",
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

    return builder.exec();
  },

  findBySlug(slug: string, agencyId: string) {
    return PropertyModel.findOne({ slug, agencyId }).lean();
  },

  findById,

  create(data: Partial<IProperty>) {
    return PropertyModel.create(data);
  },

  update(id: string, agencyId: string, data: Partial<IProperty>) {
    return PropertyModel.findOneAndUpdate({ _id: id, agencyId }, data, { new: true });
  },

  async delete(id: string, agencyId: string) {
    const result = await PropertyModel.deleteOne({ _id: id, agencyId });
    return result.deletedCount > 0;
  },

  async findRelated(propertyId: string, agencyId: string, limit = 4) {
    const property = await findById(propertyId, agencyId);
    if (!property) return [];

    return PropertyModel.find({
      _id: { $ne: propertyId },
      agencyId,
      propertyType: property.propertyType,
      status: "available",
      price: {
        $gte: property.price * 0.7,
        $lte: property.price * 1.3,
      },
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
  },
};
