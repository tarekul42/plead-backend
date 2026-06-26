import { UserModel } from "../users/users.model";
import mongoose from "mongoose";

export const WebhooksService = {
  async handleUserCreated(data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
    public_metadata?: { role?: string; agencyId?: string };
  }) {
    const primaryEmail = data.email_addresses?.[0]?.email_address;
    if (!primaryEmail) return null;

    const agencyId = data.public_metadata?.agencyId;
    if (!agencyId || !mongoose.Types.ObjectId.isValid(agencyId)) return null;

    const role = data.public_metadata?.role;
    const validRole = role && ["agent", "manager", "admin"].includes(role) ? role : "agent";

    return UserModel.findOneAndUpdate(
      { clerkId: data.id },
      {
        $setOnInsert: {
          clerkId: data.id,
          email: primaryEmail,
          name: [data.first_name, data.last_name].filter(Boolean).join(" ") || "Unknown",
          avatarUrl: data.image_url,
          role: validRole,
          agencyId: new mongoose.Types.ObjectId(agencyId),
          isActive: true,
        },
      },
      { upsert: true, new: true },
    );
  },

  async handleUserUpdated(data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
    public_metadata?: { role?: string; agencyId?: string };
  }) {
    const primaryEmail = data.email_addresses?.[0]?.email_address;
    if (!primaryEmail) return null;

    return UserModel.findOneAndUpdate(
      { clerkId: data.id },
      {
        email: primaryEmail,
        name: [data.first_name, data.last_name].filter(Boolean).join(" ") || "Unknown",
        avatarUrl: data.image_url,
      },
      { new: true },
    );
  },

  async handleUserDeleted(data: { id: string }) {
    return UserModel.findOneAndUpdate({ clerkId: data.id }, { isActive: false }, { new: true });
  },
};
