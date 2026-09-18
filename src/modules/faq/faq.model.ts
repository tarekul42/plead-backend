import mongoose, { Schema, Document } from "mongoose";

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  createdAt: Date;
}

const faqSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, maxlength: 2000 },
    category: { type: String, required: true, default: "general" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

faqSchema.index({ sortOrder: 1 });

export const FAQModel = mongoose.model<IFAQ>("FAQ", faqSchema);
