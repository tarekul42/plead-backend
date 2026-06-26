import { Router } from "express";
import express from "express";
import { WebhooksController } from "./webhooks.controller";
import { globalRateLimit } from "../../core/middleware/rate-limit.middleware";

const webhooksRouter = Router();

webhooksRouter.use(globalRateLimit);
webhooksRouter.post("/clerk", express.raw({ type: "application/json" }), WebhooksController.clerk);

export { webhooksRouter };
