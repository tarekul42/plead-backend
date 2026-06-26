import { UserModel } from "../users/users.model";
import mongoose from "mongoose";
import { logger } from "../../core/utils/logger";
import { AppError } from "../../core/utils/app-error";

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
    if (!primaryEmail) {
      throw new AppError(400, "WEBHOOK_VALIDATION", "User has no email address");
    }

    const agencyId = data.public_metadata?.agencyId;
    if (!agencyId || !mongoose.Types.ObjectId.isValid(agencyId)) {
      throw new AppError(400, "WEBHOOK_VALIDATION", "Missing or invalid agencyId in user public_metadata");
    }

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
    if (!primaryEmail) {
      logger.warn({ id: data.id }, "Skipping user.update — no email address");
      return null;
    }

    const update: Record<string, unknown> = {
      email: primaryEmail,
      name: [data.first_name, data.last_name].filter(Boolean).join(" ") || "Unknown",
      avatarUrl: data.image_url,
      role: data.public_metadata?.role && ["agent", "manager", "admin"].includes(data.public_metadata.role)
        ? data.public_metadata.role
        : undefined,
      agencyId: data.public_metadata?.agencyId && mongoose.Types.ObjectId.isValid(data.public_metadata.agencyId)
        ? new mongoose.Types.ObjectId(data.public_metadata.agencyId)
        : undefined,
    };

    for (const k of Object.keys(update)) {
      if (update[k] === undefined) delete update[k];
    }

    return UserModel.findOneAndUpdate(
      { clerkId: data.id },
      update,
      { new: true },
    );
  },

  async handleUserDeleted(data: { id: string }) {
    return UserModel.findOneAndUpdate({ clerkId: data.id }, { isActive: false }, { new: true });
  },
};
