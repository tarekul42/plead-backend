import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
  agencyId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  budget?: number;
  preferredLocation?: string;
  propertyType?: string;
  bedsDesired?: number;
  bathsDesired?: number;
  notes?: string;
  status: "new" | "contacted" | "qualified" | "negotiating" | "closed" | "lost";
  source?: string;
  assignedAgentId: mongoose.Types.ObjectId;
  lastContactedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    budget: { type: Number, min: 0 },
    preferredLocation: { type: String },
    propertyType: { type: String },
    bedsDesired: { type: Number, min: 0 },
    bathsDesired: { type: Number, min: 0 },
    notes: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "negotiating", "closed", "lost"],
      default: "new",
      index: true,
    },
    source: { type: String },
    assignedAgentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastContactedAt: { type: Date },
  },
  { timestamps: true },
);

leadSchema.index({ agencyId: 1, status: 1 });
leadSchema.index({ agencyId: 1, assignedAgentId: 1 });
leadSchema.index({ agencyId: 1, email: 1 }, { unique: true });

export const LeadModel = mongoose.model<ILead>("Lead", leadSchema);
