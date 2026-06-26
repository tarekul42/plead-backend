import mongoose, { Schema, Document } from "mongoose";

export interface IAgency extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
}

const agencySchema = new Schema<IAgency>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logoUrl: { type: String },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
  },
  { timestamps: true },
);

agencySchema.index({ name: 1 });

export const AgencyModel = mongoose.model<IAgency>("Agency", agencySchema);
