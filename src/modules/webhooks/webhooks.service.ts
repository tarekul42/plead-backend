import { UsersService } from "../users";

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

    return UsersService.create({
      clerkId: data.id,
      email: primaryEmail,
      name: [data.first_name, data.last_name].filter(Boolean).join(" ") || "Unknown",
      avatarUrl: data.image_url,
      role: (data.public_metadata?.role as any) || "agent",
      agencyId: data.public_metadata?.agencyId as any,
      isActive: true,
    } as any);
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
      role: (data.public_metadata?.role as any) || "agent",
    } as any);
  },

  async handleUserDeleted(data: { id: string }) {
    return UsersService.update(data.id, { isActive: false } as any);
  },
};
