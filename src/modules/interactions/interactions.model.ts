import mongoose, { Schema, Document } from "mongoose";

export interface IInteraction extends Document {
  agencyId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  type: "call" | "email" | "meeting" | "note" | "tour" | "other";
  subject?: string;
  notes?: string;
  outcome?: string;
  scheduledAt?: Date;
  performedById: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const interactionSchema = new Schema<IInteraction>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    type: {
      type: String,
      enum: ["call", "email", "meeting", "note", "tour", "other"],
      required: true,
    },
    subject: { type: String, maxlength: 200 },
    notes: { type: String },
    outcome: { type: String },
    scheduledAt: { type: Date },
    performedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

interactionSchema.index({ leadId: 1, agencyId: 1, createdAt: -1 });
interactionSchema.index({ agencyId: 1, performedById: 1, createdAt: -1 });
interactionSchema.index({ agencyId: 1, createdAt: -1 });

export const InteractionModel = mongoose.model<IInteraction>("Interaction", interactionSchema);
