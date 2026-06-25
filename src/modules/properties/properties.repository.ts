import { PropertyModel, IProperty } from "./properties.model";

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
  return PropertyModel.findOne({ _id: id, agencyId });
}

export const propertiesRepository = {
  async list(params: ListParams) {
    const filter: Record<string, unknown> = { agencyId: params.agencyId };

    if (params.q) {
      filter.$text = { $search: params.q };
    }
    if (params.location) {
      filter.location = { $regex: params.location, $options: "i" };
    }
    if (params.propertyType) {
      filter.propertyType = params.propertyType;
    }
    if (params.status) {
      filter.status = params.status;
    }
    if (params.beds) {
      filter.beds = { $gte: params.beds };
    }
    if (params.priceMin || params.priceMax) {
      filter.price = {};
      if (params.priceMin) (filter.price as Record<string, unknown>).$gte = params.priceMin;
      if (params.priceMax) (filter.price as Record<string, unknown>).$lte = params.priceMax;
    }

    const sortMap: Record<string, string> = {
      newest: "publishedAt",
      oldest: "publishedAt",
      "price-asc": "price",
      "price-desc": "price",
    };

    const sortField = sortMap[params.sort || "newest"] || "publishedAt";
    const sortDir: 1 | -1 = params.sort === "oldest" || params.sort === "price-asc" ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortDir };

    const skip = (params.page - 1) * params.limit;
    const data = await PropertyModel.find(filter).sort(sort).skip(skip).limit(params.limit).lean();
    const total = await PropertyModel.countDocuments(filter);

    return { data, total };
  },

  findBySlug(slug: string, agencyId: string) {
    return PropertyModel.findOne({ slug, agencyId });
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

  incrementViews(id: string, agencyId: string) {
    return PropertyModel.updateOne({ _id: id, agencyId }, { $inc: { views: 1 } });
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
