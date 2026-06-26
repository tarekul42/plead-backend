import mongoose, { Schema, Document } from "mongoose";
import { ROLES, type Role } from "../../core/constants";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
  agencyId: mongoose.Types.ObjectId;
  phone?: string;
  title?: string;
  isActive: boolean;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    role: {
      type: String,
      enum: ROLES,
      required: true,
      default: "agent",
    },
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    phone: { type: String },
    title: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ agencyId: 1, role: 1 });

export const UserModel = mongoose.model<IUser>("User", userSchema);
