import { Router } from "express";
import { ContactController } from "./contact.controller";
import { validate } from "../../core/middleware/validate.middleware";
import { createContactSchema } from "./contact.validation";
import { globalRateLimit } from "../../core/middleware/rate-limit.middleware";

const contactRouter = Router();

contactRouter.post(
  "/",
  globalRateLimit,
  validate(createContactSchema),
  ContactController.submit,
);

export { contactRouter };
