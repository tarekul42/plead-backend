import { UsersService } from "../users";
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

    return UsersService.create({
      clerkId: data.id,
      email: primaryEmail,
      name: [data.first_name, data.last_name].filter(Boolean).join(" ") || "Unknown",
      avatarUrl: data.image_url,
      role: "agent",
      agencyId: new mongoose.Types.ObjectId(agencyId),
      isActive: true,
    });
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

    return UsersService.update(data.id, {
      email: primaryEmail,
      name: [data.first_name, data.last_name].filter(Boolean).join(" ") || "Unknown",
      avatarUrl: data.image_url,
    });
  },

  async handleUserDeleted(data: { id: string }) {
    return UsersService.update(data.id, { isActive: false });
  },
};
