import { FavoriteModel } from "./favorites.model";

export const FavoritesService = {
  async list(userId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      FavoriteModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("propertyId")
        .lean(),
      FavoriteModel.countDocuments({ userId }),
    ]);
    return { data, total };
  },

  async add(userId: string, propertyId: string, agencyId: string) {
    return FavoriteModel.findOneAndUpdate(
      { userId, propertyId },
      { userId, propertyId, agencyId },
      { upsert: true, new: true },
    );
  },

  async remove(userId: string, propertyId: string) {
    return FavoriteModel.findOneAndDelete({ userId, propertyId });
  },

  async check(userId: string, propertyId: string) {
    const exists = await FavoriteModel.findOne({ userId, propertyId }).lean();
    return { isFavorited: !!exists };
  },
};
