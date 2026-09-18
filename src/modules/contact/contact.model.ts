import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  propertyId?: mongoose.Types.ObjectId;
  status: "new" | "read" | "replied";
  createdAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },
  },
  { timestamps: true },
);

contactSchema.index({ status: 1, createdAt: -1 });

export const ContactModel = mongoose.model<IContact>("Contact", contactSchema);
