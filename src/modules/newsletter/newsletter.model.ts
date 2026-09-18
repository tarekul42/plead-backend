import mongoose, { Schema, Document } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  status: "active" | "unsubscribed";
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true },
);

newsletterSchema.index({ email: 1 }, { unique: true });

export const NewsletterModel = mongoose.model<INewsletter>("Newsletter", newsletterSchema);
