import mongoose, { Schema, Document } from "mongoose";

export interface IAiGeneratedCopy extends Document {
  agencyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "property-description" | "outreach-email";
  propertyId?: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  tone: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiGeneratedCopySchema = new Schema<IAiGeneratedCopy>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["property-description", "outreach-email"],
      required: true,
    },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    tone: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

aiGeneratedCopySchema.index({ agencyId: 1, type: 1 });
aiGeneratedCopySchema.index({ propertyId: 1 });

export const AiGeneratedCopyModel = mongoose.model<IAiGeneratedCopy>(
  "AiGeneratedCopy",
  aiGeneratedCopySchema,
);
