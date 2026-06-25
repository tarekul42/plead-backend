import { Router } from "express";
import { WebhooksController } from "./webhooks.controller";

const webhooksRouter = Router();

webhooksRouter.post("/clerk", WebhooksController.clerk);

export { webhooksRouter };
