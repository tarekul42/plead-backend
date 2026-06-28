import mongoose, { Schema, Document } from "mongoose";

interface ICacheEntry extends Document {
  key: string;
  data: unknown;
  expiresAt: Date;
}

const cacheSchema = new Schema<ICacheEntry>({
  key: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true, index: true },
});

cacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CacheModel = mongoose.model<ICacheEntry>("Cache", cacheSchema);

const MAX_CACHE_ENTRIES = 1000;

async function evictIfNeeded(): Promise<void> {
  const count = await CacheModel.countDocuments();
  if (count < MAX_CACHE_ENTRIES) return;
  const toEvict = count - MAX_CACHE_ENTRIES + 1;
  await CacheModel.find({})
    .sort({ expiresAt: 1 })
    .limit(toEvict)
    .then((docs) => {
      const ids = docs.map((d) => d._id);
      if (ids.length > 0) return CacheModel.deleteMany({ _id: { $in: ids } });
    });
}

export async function cacheGet<T>(key: string): Promise<T | undefined> {
  const entry = await CacheModel.findOne({ key, expiresAt: { $gt: new Date() } }).lean();
  return entry?.data as T | undefined;
}

export async function cacheSet(key: string, data: unknown, ttlMs: number): Promise<void> {
  await CacheModel.findOneAndUpdate(
    { key },
    { key, data, expiresAt: new Date(Date.now() + ttlMs) },
    { upsert: true, new: true, lean: true },
  );
  await evictIfNeeded();
}
