import { Router } from "express";
import { NewsletterController } from "./newsletter.controller";
import { validate } from "../../core/middleware/validate.middleware";
import { subscribeNewsletterSchema } from "./newsletter.validation";
import { globalRateLimit } from "../../core/middleware/rate-limit.middleware";

const newsletterRouter = Router();

newsletterRouter.post(
  "/subscribe",
  globalRateLimit,
  validate(subscribeNewsletterSchema),
  NewsletterController.subscribe,
);

export { newsletterRouter };
