import { Request, Response } from "express";
import { Webhook } from "svix";
import { env } from "../../core/config/env";
import { asyncHandler } from "../../core/utils/async-handler";
import { success, error } from "../../core/utils/api-response";
import { logger } from "../../core/utils/logger";
import { WebhooksService } from "./webhooks.service";

type ClerkWebhookPayload = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
    public_metadata?: { role?: string; agencyId?: string };
  };
};

export const WebhooksController = {
  clerk: asyncHandler(async (req: Request, res: Response) => {
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    let evt: ClerkWebhookPayload;

    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];
    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json(error("WEBHOOK_INVALID", "Missing Svix headers"));
    }
    try {
      evt = wh.verify(req.body, {
        "svix-id": String(svixId),
        "svix-timestamp": String(svixTimestamp),
        "svix-signature": String(svixSignature),
      }) as ClerkWebhookPayload;
    } catch (err) {
      logger.error({ err }, "Webhook verification failed");
      return res.status(400).json(error("WEBHOOK_INVALID", "Invalid webhook signature"));
    }

    const { type, data } = evt;

    try {
      switch (type) {
        case "user.created":
          await WebhooksService.handleUserCreated(data);
          break;
        case "user.updated":
          await WebhooksService.handleUserUpdated(data);
          break;
        case "user.deleted":
          await WebhooksService.handleUserDeleted(data);
          break;
        default:
          logger.info({ type }, "Unhandled webhook event");
      }
    } catch (err) {
      logger.error({ err, type }, "Webhook handler error");
      return res.status(500).json(error("WEBHOOK_ERROR", "Failed to process webhook"));
    }

    res.json(success({ received: true }));
  }),
};
