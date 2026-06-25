import { Request, Response } from "express";
import { Webhook } from "svix";
import { env } from "../../core/config/env";
import { asyncHandler } from "../../core/utils/async-handler";
import { success, error } from "../../core/utils/api-response";
import { logger } from "../../core/utils/logger";
import { WebhooksService } from "./webhooks.service";

export const WebhooksController = {
  clerk: asyncHandler(async (req: Request, res: Response) => {
    const payload = JSON.stringify(req.body);
    const headers = req.headers;

    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    let evt: { type: string; data: Record<string, unknown> };

    try {
      evt = wh.verify(payload, {
        "svix-id": headers["svix-id"] as string,
        "svix-timestamp": headers["svix-timestamp"] as string,
        "svix-signature": headers["svix-signature"] as string,
      }) as any;
    } catch (err) {
      logger.error({ err }, "Webhook verification failed");
      return res.status(400).json(error("WEBHOOK_INVALID", "Invalid webhook signature"));
    }

    const { type, data } = evt;

    try {
      switch (type) {
        case "user.created":
          await WebhooksService.handleUserCreated(data as any);
          break;
        case "user.updated":
          await WebhooksService.handleUserUpdated(data as any);
          break;
        case "user.deleted":
          await WebhooksService.handleUserDeleted(data as any);
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
