import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatarUrl?: string;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    quote: { type: String, required: true, maxlength: 1000 },
    avatarUrl: { type: String },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

testimonialSchema.index({ featured: 1, sortOrder: 1 });

export const TestimonialModel = mongoose.model<ITestimonial>("Testimonial", testimonialSchema);
