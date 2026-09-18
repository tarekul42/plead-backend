import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true },
  },
  { timestamps: true },
);

favoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, createdAt: -1 });

export const FavoriteModel = mongoose.model<IFavorite>("Favorite", favoriteSchema);
