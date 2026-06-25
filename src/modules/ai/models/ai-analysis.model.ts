import mongoose, { Schema, Document } from "mongoose";

export interface IAiAnalysis extends Document {
  agencyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "lead-matching" | "property-description" | "outreach-email";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  provider: string;
  tokensUsed: number;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiAnalysisSchema = new Schema<IAiAnalysis>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["lead-matching", "property-description", "outreach-email"],
      required: true,
      index: true,
    },
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed, required: true },
    provider: { type: String, required: true },
    tokensUsed: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    success: { type: Boolean, required: true },
    errorMessage: { type: String },
  },
  { timestamps: true },
);

aiAnalysisSchema.index({ agencyId: 1, type: 1, createdAt: -1 });

export const AiAnalysisModel = mongoose.model<IAiAnalysis>("AiAnalysis", aiAnalysisSchema);
