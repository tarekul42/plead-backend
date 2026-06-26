import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  agencyId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 200 },
    comment: { type: String, maxlength: 2000 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reviewSchema.index({ propertyId: 1, agencyId: 1, createdAt: -1 });
reviewSchema.index({ agencyId: 1, isVerified: 1, createdAt: -1 });
reviewSchema.index({ agencyId: 1, rating: 1 });
reviewSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>("Review", reviewSchema);
