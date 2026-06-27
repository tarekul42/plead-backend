import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
  agencyId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  location: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images: string[];
  beds: number;
  baths: number;
  area: number;
  propertyType: "house" | "apartment" | "condo" | "townhouse" | "land" | "commercial";
  status: "available" | "sold" | "rented" | "pending";
  features: string[];
  assignedAgentId: mongoose.Types.ObjectId;
  views: number;
  inquiriesCount: number;
  publishedAt?: Date;
  assignedAgent?: { _id: unknown; name: string; email: string; avatarUrl?: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    images: [{ type: String }],
    beds: { type: Number, required: true, min: 0, max: 100 },
    baths: { type: Number, required: true, min: 0, max: 100 },
    area: { type: Number, required: true, min: 0 },
    propertyType: {
      type: String,
      enum: ["house", "apartment", "condo", "townhouse", "land", "commercial"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["available", "sold", "rented", "pending"],
      default: "available",
      index: true,
    },
    features: [{ type: String }],
    assignedAgentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    inquiriesCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

propertySchema.index({ title: "text", description: "text", location: "text" });
propertySchema.index({ agencyId: 1, status: 1, price: 1, beds: 1 });
propertySchema.index({ agencyId: 1, slug: 1 }, { unique: true });

export const PropertyModel = mongoose.model<IProperty>("Property", propertySchema);
